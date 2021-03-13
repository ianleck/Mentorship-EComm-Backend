import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
  STATUS_ENUM,
} from '../constants/enum';
import { COURSE_ERRORS, ERRORS, AUTH_ERRORS } from '../constants/errors';
import { Category } from '../models/Category';
import { Comment } from '../models/Comment';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { Lesson } from '../models/Lesson';
import { User } from '../models/User';
import { Announcement } from '../models/Announcement';
import EmailService from './email.service';


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

  public static async updateLesson(
    lessonId: string,
    accountId: string,
    updateLesson
  ): Promise<Lesson> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    const course = await Course.findByPk(lesson.courseId);
    // Check if user sending the request is the sensei who created the course
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await lesson.update(updateLesson);
  }

  public static async deleteLesson(
    lessonId: string,
    accountId: string
  ): Promise<void> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    const course = await Course.findByPk(lesson.courseId);
    // Check if user sending the request is the sensei who created the course
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    await Lesson.destroy({
      where: {
        lessonId,
      },
    });
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
    if (user.accountId !== course.accountId) throw new Error(httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED));
    
    const { title, description } = announcement;
    
    const newAnnouncement = new Announcement({
      courseId,
      title,
      description, 
      accountId, 
    });
    
    await newAnnouncement.save();
    return newAnnouncement;

  }

  public static async updateAnnouncement(
    announcementId: string,
    accountId: string,
    updateAnnouncement
  ): Promise<Announcement> {
    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) throw new Error(COURSE_ERRORS.ANNOUNCEMENT_MISSING);

    // Check if user sending the request is the sensei who created the announcement
    if (announcement.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await announcement.update(updateAnnouncement);
  }

  public static async deleteAnnouncement(
    announcementId: string,
    accountId: string
  ): Promise<void> {
    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) throw new Error(COURSE_ERRORS.ANNOUNCEMENT_MISSING);

    // Check if user sending the request is the sensei who created the announcemnet
    if (announcement.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    await Announcement.destroy({
      where: {
        announcementId,
      },
    });
  }

  public static async getAllAnnouncements(courseId, accountId) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);


    // Check if user sending the request is the sensei who created the course
    if (user.userType === USER_TYPE_ENUM.SENSEI && course.accountId !== accountId ) {
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    }
    //Check if user sending the request is the student who has bought this course 
    if (user.userType === USER_TYPE_ENUM.STUDENT) {
      const courseContract = await CourseContract.findOne({
        where: {
          courseId, 
          accountId, 
        }, 
      });
      if (!courseContract)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    }
    const courseAnnouncements = Announcement.findAll({
      where: {
        courseId, 
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
    return courseAnnouncements; 
  }

  public static async getAnnouncement(
    announcementId: string,
    accountId: string, 
  ): Promise<Announcement> {
    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) throw new Error(COURSE_ERRORS.ANNOUNCEMENT_MISSING);

    const course = await Course.findByPk(announcement.courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);


    // Check if user sending the request is the sensei who created announcement
    if (user.userType === USER_TYPE_ENUM.SENSEI && announcement.accountId !== accountId) {
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    }
    //Check if user sending the request is the student who has bought this course 
    if (user.userType === USER_TYPE_ENUM.STUDENT) {
      const courseContract = await CourseContract.findOne({
        where: {
          courseId: course.courseId, 
          accountId, 
        }, 
      });
      if (!courseContract)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    }

    const courseAnnouncement = await Announcement.findOne({
      where: {
        announcementId, 
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
    return courseAnnouncement; 
  }


  // ======================================== COURSE REQUESTS ========================================
  public static async getAllRequests() {
    const courseRequests = Course.findAll({
      where: {
        adminVerified: ADMIN_VERIFIED_ENUM.PENDING,
      },
    });
    return courseRequests; 
  }

  public static async getRequest(
    courseId: string
  ): Promise<Course> {
    const courseRequest = await Course.findByPk(courseId); 
    if (!courseRequest) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    return courseRequest; 
  }

  public static async acceptCourseRequest(courseId) {
    const courseRequest = await Course.findOne({
      where: {
        courseId,
      },
    }); 

    if (!courseRequest) throw new Error (COURSE_ERRORS.COURSE_MISSING);

    // Check that sensei still exists 
    const sensei = await User.findByPk(courseRequest.accountId);
    if (!sensei) throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);

    if (sensei.status === STATUS_ENUM.BANNED) throw new Error(AUTH_ERRORS.USER_BANNED);

    if (sensei.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED) throw new Error (COURSE_ERRORS.USER_NOT_VERIFIED);

    const acceptedCourse = await courseRequest.update({
      adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
    });

    const courseName = courseRequest.title;
    const additional = { courseName }; 

    // Send Email to inform acceptance of course request
    await EmailService.sendEmail(sensei.email, 'acceptCourse', additional)

    return acceptedCourse; 

  }

  public static async rejectCourseRequest(courseId) {
    const courseRequest = await Course.findOne({
      where: {
        courseId,
      },
    }); 

    if (!courseRequest) throw new Error (COURSE_ERRORS.COURSE_MISSING);


    // Check that sensei still exists 
    const sensei = await User.findByPk(courseRequest.accountId);
    if (!sensei) throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);

    if (sensei.status === STATUS_ENUM.BANNED) throw new Error(AUTH_ERRORS.USER_BANNED);

    const rejectedCourse = await courseRequest.update({
      adminVerified: ADMIN_VERIFIED_ENUM.REJECTED,
    });

    const courseName = courseRequest.title;
    const additional = { courseName }; 

    // Send Email to inform acceptance of course request
    await EmailService.sendEmail(sensei.email, 'rejectCourse' , additional)

    return rejectedCourse; 

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

  public static async getAllPurchasedCourses(userId, accountId) {
    if (userId !== accountId) throw new Error(httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED));

    const purchasedCourses = await Course.findAll({
      include: [
        { model: CourseContract, where: { accountId } },
      ],
    }); 

    return purchasedCourses;
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
