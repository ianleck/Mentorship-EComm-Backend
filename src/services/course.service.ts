import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { COURSE_ERRORS, ERRORS } from '../constants/errors';
import { Category } from '../models/Category';
import { Comment } from '../models/Comment';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { Lesson } from '../models/Lesson';
import { User } from '../models/User';

type newCourseType = {
  title?: string;
  subTitle: string;
  description: string;
  imgUrl?: string;
  language: string;
  priceAmount: number;
  currency: string;
  level: LEVEL_ENUM;
  categories: string[];
  visibility: VISIBILITY_ENUM;
  adminVerified: ADMIN_VERIFIED_ENUM;
};

type courseType = newCourseType & {
  courseId?: string;
};

type getFilter = {
  where: {
    adminVerified: ADMIN_VERIFIED_ENUM;
    visibility: VISIBILITY_ENUM;
  };
};
export default class CourseService {
  // ======================================== COURSE LISTING ========================================
  // Create course draft (no courseId)
  public static async createCourseDraft(
    accountId: string,
    course: newCourseType
  ): Promise<Course> {
    const { categories, ...draftWithoutCategories } = course;

    const newCourse = new Course({
      ...draftWithoutCategories,
      accountId,
    });

    await newCourse.save();

    await CourseListingToCategory.bulkCreate(
      categories.map((categoryId) => ({
        courseId: newCourse.courseId,
        categoryId,
      }))
    );

    return Course.findByPk(newCourse.courseId, {
      include: [Category],
    });
  }

  // can be draft or existing published course
  public static async updateCourse(
    accountId: string,
    courseId: string,
    updatedDraft: courseType
  ): Promise<Course> {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ); // course not created by user

    const user = await User.findByPk(accountId);
    if (
      // if user is submitting course request or if user is tryign to publish course
      // but user account has not been verified/accepted by admin, throw error.
      (updatedDraft.adminVerified === ADMIN_VERIFIED_ENUM.PENDING ||
        updatedDraft.visibility === VISIBILITY_ENUM.PUBLISHED) &&
      user.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED
    )
      throw new Error(COURSE_ERRORS.USER_NOT_VERIFIED);

    if (
      // If user is trying to publish the course request but course has not been verified/accepted by admin, throw error
      updatedDraft.visibility === VISIBILITY_ENUM.PUBLISHED &&
      updatedDraft.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED
    )
      throw new Error(COURSE_ERRORS.COURSE_NOT_VERIFIED);
    const { categories, ...courseWithoutCategories } = updatedDraft;

    if (categories != null)
      await this.updateCourseCategory(courseId, updatedDraft); // update categories
    await course.update(courseWithoutCategories); // update course draft

    return Course.findByPk(courseId, {
      include: [Category],
    });
  }

  public static async updateCourseCategory(
    courseId: string,
    course: courseType
  ): Promise<void> {
    // Find all category associations with listing
    const listingCategories: CourseListingToCategory[] = await CourseListingToCategory.findAll(
      {
        where: { courseId },
      }
    );

    const existingCategories: string[] = listingCategories.map(
      ({ categoryId }) => categoryId
    );
    const updatedCategories: string[] = course.categories;

    const categoriesToAdd = _.difference(updatedCategories, existingCategories);
    const categoriesToRemove = _.difference(
      existingCategories,
      updatedCategories
    );

    // Create new associations to new categories
    await CourseListingToCategory.bulkCreate(
      categoriesToAdd.map((categoryId) => ({
        courseId,
        categoryId,
      }))
    );

    // Delete associations to removed categories
    await Promise.all(
      categoriesToRemove.map(
        async (categoryId) =>
          await CourseListingToCategory.destroy({
            where: {
              courseId,
              categoryId,
            },
          })
      )
    );
  }

  public static async getAllCourses() {
    const courses = Course.findAll({
      where: {
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED, // courses that have been approved by admin
        visibility: VISIBILITY_ENUM.PUBLISHED, // courses that are not hidden
      },
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    return courses;
  }

  public static async getAllSenseiCourses(
    accountId: string,
    filter: getFilter
  ) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    const courses = Course.findAll({
      where: {
        ...filter.where,
        accountId,
      },
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        CourseContract,
      ],
    });
    return courses;
  }

  /**
   * @param obj = {
   *  courseId: string,
   *  extraModels: Models[]
   *  inclSoftDelete: boolean
   * }
   */
  public static async getCourseWithAssociations({
    courseId,
    extraModels,
    // withCourseContract: boolean,
    inclSoftDelete, // true to return rows that are soft deleted. False otherwise
  }) {
    return await Course.findByPk(courseId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        ...extraModels,
      ],
      paranoid: !inclSoftDelete,
    });
  }

  public static async getOneCourse(courseId: string, user?) {
    const _user = user ? await User.findByPk(user.accountId) : null;

    // if no user, return course without contract and dont need to find deleted ones
    let course;
    if (!_user) {
      // return course without contracts that are not soft deleted
      course = await this.getCourseWithAssociations({
        courseId,
        extraModels: [Lesson],
        inclSoftDelete: false,
      });
      if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
      return course;
    }

    // if user and is a student, see if student has a course with the course.
    if (_user.userType === USER_TYPE_ENUM.STUDENT) {
      const existingContract = CourseContract.findOne({
        where: {
          courseId,
          accountId: _user.accountId,
        },
      });

      if (existingContract) {
        // if student has bought the course, return
      }
    }
    // if true, return course, else return course that isnt soft delted
    const courseWithoutContracts = await this.getCourseWithAssociations({
      courseId,
      extraModels: [Lesson],
      inclSoftDelete: true,
    });

    // if user is logged in but not the publishing sensei and not an admin
    // return course without contracts
    if (
      _user.userType !== USER_TYPE_ENUM.ADMIN &&
      _user.accountId !== courseWithoutContracts.accountId
    ) {
      return courseWithoutContracts;
    }

    // else return course with contract (for publishing sensei and admins)
    return this.getCourseWithAssociations({
      courseId,
      extraModels: [Lesson, CourseContract],
      inclSoftDelete: true,
    });
  }

  // ======================================== LESSONS ========================================
  public static async createLessonShell(
    courseId: string,
    accountId: string
  ): Promise<Lesson> {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    const user = await User.findByPk(accountId);
    if (user.accountId !== course.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    const lesson = new Lesson({
      courseId,
    });
    await lesson.save();
    return lesson;
  }

  // ======================================== ANNOUNCEMENTS ========================================
  public static async createAnnouncement(
    courseId: string,
    accountId: string,
    announcement: {
      title: string;
      description: string;
    }
  ): Promise<Announcement> {

    const course = await Course.findByPk(courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    const user = await User.findByPk(accountId);
    if (user.accountId !== course.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
      const { title, description } = announcement;

    const newAnnouncement = new Announcement({
      courseId,
      title,
      description, 
    });
    await newAnnouncement.save();
    return newAnnouncement;
  }

  // ======================================== COURSE CONTRACT ========================================
  public static async createContract(
    accountId: string,
    courseId: string
  ): Promise<CourseContract> {
    const course = await Course.findOne({
      where: {
        courseId,
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
      },
    });

    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const existingContract = await CourseContract.findOne({
      where: {
        courseId,
        accountId,
      },
    });

    if (existingContract) throw new Error(COURSE_ERRORS.CONTRACT_EXISTS);

    const newContract = new CourseContract({
      courseId,
      accountId,
    });

    await newContract.save();

    return newContract;
  }

  /**
   * Get course contract if request.user is a student that signed up with the course
   * @param courseId
   * @param accountId
   */
  public static async getContractIfExist(courseId: string, accountId: string) {
    return await CourseContract.findOne({
      where: {
        accountId,
        courseId,
      },
    });
  }

  // ======================================== COMMENTS ========================================
  public static async createComment(
    accountId: string,
    lessonId: string,
    bodyText: string
  ): Promise<Comment> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);
    const comment = new Comment({
      accountId,
      lessonId,
      body: bodyText,
    });

    await comment.save();
    return comment;
  }

  public static async getLessonComments(lessonId: string): Promise<Comment[]> {
    return Comment.findAll({
      where: {
        lessonId,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
  }
}

/**
 * Existing course draft
 * 2. Request approval to publish
 * - Check if sensei is approved. if yes, change course.adminApproval to PENDING
 *
 * 3. Approve course publish request
 * - update course, change adminverified -> approved.
 *
 */
