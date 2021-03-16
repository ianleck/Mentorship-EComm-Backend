import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR } from '../constants/errors';
import { REVIEW_RESPONSE } from '../constants/successMessages';
import ReviewService from '../services/review.service';
import apiResponse from '../utilities/apiResponse';
export class ReviewController {
  // ================================ USER RELATED UPLOADS ================================
  public static async createCourseReview(req, res) {
    const { courseId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    console.log('review =', review);
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
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async createMentorshipListingReview(req, res) {
    const { mentorshipListingId } = req.params;
    const { accountId } = req.user;
    const { review } = req.body;
    console.log('review =', review);
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
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
