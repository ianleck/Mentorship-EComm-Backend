import httpStatusCodes from 'http-status-codes';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { AUTH_ERRORS, COURSE_ERRORS, ERRORS } from '../constants/errors';
import { Announcement } from '../models/Announcement';
import { Category } from '../models/Category';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { CourseListingToCategory } from '../models/CourseListingToCategory';
import { Lesson } from '../models/Lesson';
import { Note } from '../models/Note';
import { Review } from '../models/Review';
import { User } from '../models/User';
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
  publishedAt?: Date;
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
      (course.adminVerified === ADMIN_VERIFIED_ENUM.PENDING ||
        updatedDraft.visibility === VISIBILITY_ENUM.PUBLISHED) &&
      user.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED
    )
      throw new Error(COURSE_ERRORS.USER_NOT_VERIFIED);

    if (
      // If user is trying to publish the course request but course has not been verified/accepted by admin, throw error
      updatedDraft.visibility === VISIBILITY_ENUM.PUBLISHED &&
      course.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED
    )
      throw new Error(COURSE_ERRORS.COURSE_NOT_VERIFIED);
    const { categories, ...courseWithoutCategories } = updatedDraft;

    if (categories != null)
      await this.updateCourseCategory(courseId, updatedDraft); // update categories
    if (
      // if user is publishign course for the first time
      !course.publishedAt &&
      updatedDraft.visibility === VISIBILITY_ENUM.PUBLISHED
    ) {
      courseWithoutCategories.publishedAt = new Date();
    }
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

  public static async deleteCourseDraft(courseId: string, accountId: string) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_DRAFT_MISSING);
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    if (course.publishedAt) throw new Error(COURSE_ERRORS.DELETE_DISALLOWED);
    await Course.destroy({
      where: {
        courseId,
      },
    });
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
   * }
   */
  private static async getCourseWithAssociations({ courseId, extraModels }) {
    return await Course.findByPk(courseId, {
      include: [
        Category,
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl', 'occupation'],
        },
        ...extraModels,
      ],
    });
  }

  public static async getOneCourse(courseId: string, user?) {
    const courseWithoutContracts = await this.getCourseWithAssociations({
      courseId,
      extraModels: [
        Lesson,
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: [
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
        },
      ],
    });
    if (!courseWithoutContracts) throw new Error(COURSE_ERRORS.COURSE_MISSING);
    /** if user is not logged in
     * OR (user is not the sensei who created the course listing AND user is not an admin)
     * return course without contracts
     */
    if (
      !user ||
      (user.accountId !== courseWithoutContracts.accountId &&
        user.userType !== USER_TYPE_ENUM.ADMIN)
    ) {
      return courseWithoutContracts;
    }

    // else return course with contract (for publishing sensei and admins)
    return this.getCourseWithAssociations({
      courseId,
      extraModels: [
        Lesson,
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: [
                'firstName',
                'lastName',
                'profileImgUrl',
                'occupation',
              ],
            },
          ],
        },
        CourseContract,
      ],
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

    // update all course contract lesson progress
    const existingContracts = await CourseContract.findAll({
      where: { courseId: lesson.courseId },
    });

    // find courseContracts to update
    const contractsToUpdate = existingContracts.filter(
      (c) => c.lessonProgress.indexOf(lessonId) != -1
    );

    await Promise.all(
      contractsToUpdate.map((contract) => {
        const lessonProgress = contract.lessonProgress;

        // remove lessonId from lessonProgress if it exist in lessonProgress
        const index = lessonProgress.indexOf(lessonId);
        lessonProgress.splice(index, 1);
        return contract.update({
          lessonProgress,
        });
      })
    );
  }

  // ======================================== NOTES ========================================
  public static async addNoteToLesson(
    lessonId: string,
    accountId: string,
    note: {
      title: string;
      body: string;
    }
  ): Promise<Note> {
    await CourseService.noteAuthorizationCheck(lessonId, accountId);

    const { title, body } = note;

    const newNote = new Note({
      lessonId,
      title,
      body,
    });

    await newNote.save();

    return newNote;
  }

  public static async editNoteInLesson(
    noteId: string,
    accountId: string,
    updateNote
  ): Promise<Note> {
    const note = await Note.findByPk(noteId);
    if (!note) throw new Error(COURSE_ERRORS.NOTE_MISSING);

    await CourseService.noteAuthorizationCheck(note.lessonId, accountId);

    return await note.update(updateNote);
  }

  public static async getAllNotes(lessonId, accountId) {
    const lessonNotes = Note.findAll({
      where: {
        lessonId,
      },
    });
    return lessonNotes;
  }

  public static async noteAuthorizationCheck(lessonId, accountId) {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const user = await User.findByPk(accountId);
    if (user.accountId !== course.accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
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
      accountId,
    });

    await newAnnouncement.save();

    if (course.adminVerified === ADMIN_VERIFIED_ENUM.ACCEPTED) {
      const contracts = await CourseContract.findAll({
        where: { courseId },
      });

      const accountIds = contracts.map((aId) => aId.accountId);

      const users = await User.findAll({
        where: { accountId: accountIds },
      });

      const listOfEmails = users.map((lom) => lom.email);

      const courseName = course.title;
      const announcementContent = newAnnouncement.description;
      const announcementTitle = newAnnouncement.title;
      const additional = { courseName, announcementTitle, announcementContent };

      await EmailService.sendMassEmail(
        listOfEmails,
        'newAnnouncement',
        additional
      );
    }

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
    if (user) {
      // Check if user sending the request is the sensei who created the course
      if (
        user.userType === USER_TYPE_ENUM.SENSEI &&
        course.accountId !== accountId
      ) {
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
    accountId: string
  ): Promise<Announcement> {
    const announcement = await Announcement.findByPk(announcementId);
    if (!announcement) throw new Error(COURSE_ERRORS.ANNOUNCEMENT_MISSING);

    const course = await Course.findByPk(announcement.courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    const user = await User.findByPk(accountId);
    if (user) {
      // Check if user sending the request is the sensei who created announcement
      if (
        user.userType === USER_TYPE_ENUM.SENSEI &&
        announcement.accountId !== accountId
      ) {
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
    if (userId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const purchasedCourses = await Course.findAll({
      include: [{ model: CourseContract, where: { accountId } }],
    });

    const lessonCounts = await Promise.all(
      purchasedCourses.map((course) => {
        return Lesson.count({ where: { courseId: course.courseId } });
      })
    );

    const returnCourses = purchasedCourses.map((course, i) => {
      return {
        ...course,
        numLessons: lessonCounts[i],
      };
    });

    return returnCourses;
  }

  public static async markLessonCompleted(
    courseContractId: string,
    lessonId: string
  ) {
    const courseContract = await CourseContract.findByPk(courseContractId);
    if (!courseContract) throw new Error(COURSE_ERRORS.CONTRACT_MISSING);

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    const lessonProgress = courseContract.lessonProgress;
    if (lessonProgress.indexOf(lessonId) == -1) {
      // if lesson has not been completed
      lessonProgress.push(lessonId);
    }
    return courseContract.update({
      lessonProgress,
    });
  }

  // ======================================== COURSE REQUESTS ========================================
  public static async getAllRequests() {
    const courseRequests = Course.findAll({
      where: {
        adminVerified: {
          [Op.or]: [
            ADMIN_VERIFIED_ENUM.ACCEPTED,
            ADMIN_VERIFIED_ENUM.PENDING,
            ADMIN_VERIFIED_ENUM.REJECTED,
          ],
        },
      },
    });
    return courseRequests;
  }

  public static async getRequest(courseId: string): Promise<Course> {
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

    if (!courseRequest) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    // Check that sensei still exists
    const sensei = await User.findByPk(courseRequest.accountId);
    if (!sensei) throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);

    if (sensei.status === STATUS_ENUM.BANNED)
      throw new Error(AUTH_ERRORS.USER_BANNED);

    if (sensei.adminVerified !== ADMIN_VERIFIED_ENUM.ACCEPTED)
      throw new Error(COURSE_ERRORS.USER_NOT_VERIFIED);

    const acceptedCourse = await courseRequest.update({
      adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
    });

    const title = courseRequest.title;
    const additional = { title };

    // Send Email to inform acceptance of course request
    await EmailService.sendEmail(sensei.email, 'acceptCourse', additional);

    return acceptedCourse;
  }

  public static async rejectCourseRequest(courseId) {
    const courseRequest = await Course.findOne({
      where: {
        courseId,
      },
    });

    if (!courseRequest) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    // Check that sensei still exists
    const sensei = await User.findByPk(courseRequest.accountId);
    if (!sensei) throw new Error(ERRORS.SENSEI_DOES_NOT_EXIST);

    if (sensei.status === STATUS_ENUM.BANNED)
      throw new Error(AUTH_ERRORS.USER_BANNED);

    const rejectedCourse = await courseRequest.update({
      adminVerified: ADMIN_VERIFIED_ENUM.REJECTED,
    });

    const title = courseRequest.title;
    const additional = { title };

    // Send Email to inform acceptance of course request
    await EmailService.sendEmail(sensei.email, 'rejectCourse', additional);

    return rejectedCourse;
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
