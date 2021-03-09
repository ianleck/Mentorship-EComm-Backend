import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { Course } from '../models/Course';
import { Category } from '../models/Category';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { CourseContract } from '../models/CourseContract';
import { COURSE_ERRORS, ERRORS } from '../constants/errors';
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

  public static async getOneCourse(courseId: string, user?) {
    const _user = user ? await User.findByPk(user.accountId) : null;
    // if user is logged in and is the publishing sensei or if the user is an admin
    const courseWithoutContracts = await Course.findByPk(courseId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
      ],
    });
    if (!courseWithoutContracts) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    // if user is not logged in or if user is logged in but not the publishing sensei nor an admin
    // return course without contract
    if (
      !_user ||
      (_user.userType !== USER_TYPE_ENUM.ADMIN &&
        _user.accountId !== courseWithoutContracts.accountId)
    ) {
      return courseWithoutContracts;
    }

    // else return course with contract (for publishing sensei and admins)
    return await Course.findByPk(courseId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        CourseContract,
      ],
    });
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
