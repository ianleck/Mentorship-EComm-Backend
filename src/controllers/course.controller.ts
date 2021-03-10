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
        { message: COURSE_RESPONSE.COURSE_CREATE, createdListing },
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
        { message: COURSE_RESPONSE.COURSE_UPDATE, updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateCourse]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
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
   * */
  public static async getOneCourse(req, res) {
    const { courseId } = req.params;
    const { user } = req;
    console.log('user =', user);
    try {
      const course = await CourseService.getOneCourse(courseId, user);
      return apiResponse.result(
        res,
        {
          message: 'success',
          course,
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
      logger.error('[courseController.createCourse]:' + e.message);
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
        { message: COURSE_RESPONSE.COURSE_CREATE, createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createCourse]:' + e.message);
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
}
