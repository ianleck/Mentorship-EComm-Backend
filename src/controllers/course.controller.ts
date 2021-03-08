import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { COURSE_ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { COURSE_RESPONSE } from '../constants/successMessages';
import CourseService from '../services/course.service';
import apiResponse from '../utilities/apiResponse';

export class CourseController {
  // ==================== COURSE LISTING ====================
  public static async createCourse(req, res) {
    const { user } = req;
    const { newCourse } = req.body;

    try {
      const createdListing = await CourseService.createCourse(
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

  // ==================== COURSE CONTRACT ====================
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
