import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { COURSE_ERRORS, ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { COURSE_RESPONSE } from '../constants/successMessages';
import CourseService from '../services/course.service';
import apiResponse from '../utilities/apiResponse';

export class CourseController {
  // ======================================== COURSE LISTING ========================================
  public static async createCourseDraft(req, res) {
    const { user } = req;
    const { newCourse } = req.body;

    try {
      const createdListing = await CourseService.createCourseDraft(
        user.accountId,
        newCourse
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_CREATE, course: createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createCourse]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateCourse(req, res) {
    const { user } = req;
    const { courseId } = req.params;
    const { updatedCourse } = req.body;
    try {
      const updatedListing = await CourseService.updateCourse(
        user.accountId,
        courseId,
        updatedCourse
      );

      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_UPDATE, course: updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateCourse]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.USER_NOT_VERIFIED ||
        e.message === COURSE_ERRORS.COURSE_NOT_VERIFIED
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // to include search query params in the future (ie: most popular, least popular, page number)
  public static async getAllCourses(req, res) {
    try {
      const courses = await CourseService.getAllCourses();
      return apiResponse.result(
        res,
        {
          message: 'success',
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllCourses]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getAllSenseiCourses(req, res) {
    const { accountId } = req.params;
    const { adminVerified, visibility } = req.query;

    try {
      const courses = await CourseService.getAllSenseiCourses(accountId, {
        where: {
          adminVerified,
          visibility,
        },
      });
      return apiResponse.result(
        res,
        {
          message: 'success',
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllSenseiCourses]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  /** Get one course
   *  if student => get course without contract
   *  if sensei/admin => get course with contracts
   *  if user is a student and user purchased the course, return existing contract
   * */
  public static async getOneCourse(req, res) {
    const { courseId } = req.params;
    const { user } = req;
    try {
      const course = await CourseService.getOneCourse(courseId, user);
      const existingContract = await CourseService.getContractIfExist(
        courseId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          course,
          courseContract: existingContract,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getOneCourse]:' + e.message);
      if (e.message === COURSE_ERRORS.COURSE_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== LESSONS ========================================
  public static async createLessonShell(req, res) {
    const { user } = req;
    const { courseId } = req.params;

    try {
      const createdLesson = await CourseService.createLessonShell(
        courseId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_CREATE, lesson: createdLesson },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createLessonShell]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateLesson(req, res) {
    const { user } = req;
    const { lessonId } = req.params;
    const { updateLesson } = req.body;
    try {
      const updatedLesson = await CourseService.updateLesson(
        lessonId,
        user.accountId,
        updateLesson
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_UPDATE, lesson: updatedLesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.LESSON_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteLesson(req, res) {
    const { user } = req;
    const { lessonId } = req.params;
    try {
      const updatedLesson = await CourseService.deleteLesson(
        lessonId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.deleteLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.LESSON_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== COURSE CONTRACT ========================================
  public static async createContract(req, res) {
    const { user } = req;

    const { courseId } = req.params;
    try {
      const createdListing = await CourseService.createContract(
        user.accountId,
        courseId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.CONTRACT_CREATE, createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createContract]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.CONTRACT_EXISTS
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== COMMENTS ========================================
  public static async createComment(req, res) {
    const { user } = req;
    const { comment } = req.body;
    const { lessonId } = req.params;
    try {
      const createdComment = await CourseService.createComment(
        user.accountId,
        lessonId,
        comment.body
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COMMENT_CREATE, comment: createdComment },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createComment]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.CONTRACT_EXISTS
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getLessonComments(req, res) {
    const { lessonId } = req.params;
    try {
      const comments = await CourseService.getLessonComments(lessonId);
      return apiResponse.result(
        res,
        { message: 'success', comments },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getLessonComments]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
