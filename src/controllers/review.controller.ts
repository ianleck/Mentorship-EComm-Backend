import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  COURSE_ERRORS,
  MENTORSHIP_ERRORS,
  RESPONSE_ERROR,
  REVIEW_ERRORS,
} from '../constants/errors';
import { REVIEW_RESPONSE } from '../constants/successMessages';
import ReviewService from '../services/review.service';
import apiResponse from '../utilities/apiResponse';
export class ReviewController {
  public static async createCourseReview(req, res) {
    const { courseId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    try {
      const newReview = await ReviewService.createCourseReview(
        courseId,
        accountId,
        review
      );
      return apiResponse.result(
        res,
        { message: REVIEW_RESPONSE.REVIEW_CREATE, review: newReview },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[reviewController.createCourseReview]:' + e.message);
      if (
        e.message === COURSE_ERRORS.CONTRACT_MISSING ||
        e.message === REVIEW_ERRORS.REVIEW_EXISTS
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

  public static async createMentorshipListingReview(req, res) {
    const { mentorshipListingId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    try {
      const newReview = await ReviewService.createMentorshipListingReview(
        mentorshipListingId,
        accountId,
        review
      );
      return apiResponse.result(
        res,
        { message: REVIEW_RESPONSE.REVIEW_CREATE, review: newReview },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error(
        '[reviewController.createMentorshipListingReview]:' + e.message
      );

      if (
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === REVIEW_ERRORS.REVIEW_EXISTS
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

  public static async editCourseReview(req, res) {
    const { courseId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    try {
      const updatedReview = await ReviewService.editCourseReview(
        courseId,
        accountId,
        review
      );
      return apiResponse.result(
        res,
        { message: REVIEW_RESPONSE.REVIEW_UPDATE, review: updatedReview },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[reviewController.editCourseReview]:' + e.message);

      if (e.message === REVIEW_ERRORS.REVIEW_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async editMentorshipListingReview(req, res) {
    const { mentorshipListingId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    try {
      const updatedReview = await ReviewService.editMentorshipListingReview(
        mentorshipListingId,
        accountId,
        review
      );
      return apiResponse.result(
        res,
        { message: REVIEW_RESPONSE.REVIEW_UPDATE, review: updatedReview },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[reviewController.editMentorshipListingReview]:' + e.message
      );

      if (e.message === REVIEW_ERRORS.REVIEW_MISSING) {
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
