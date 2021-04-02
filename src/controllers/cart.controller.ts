import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  CART_ERRORS,
  COURSE_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
  RESPONSE_ERROR,
} from '../constants/errors';
import { CART_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import CartService from '../services/cart.service';
import apiResponse from '../utilities/apiResponse';

export class CartController {
  public static async addCourse(req, res) {
    try {
      const { courseId } = req.body;
      const { user } = req;
      const updatedCart = await CartService.addCourse(courseId, user.accountId);
      return apiResponse.result(
        res,
        { message: CART_RESPONSE.ADD_COURSE_TO_CART, updatedCart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.addCourse]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.STUDENT_DOES_NOT_EXIST,
        COURSE_ERRORS.COURSE_MISSING,
        CART_ERRORS.COURSE_PURCHASED,
        CART_ERRORS.COURSE_ALREADY_ADDED,
      ]);
    }
  }

  public static async addMentorshipListing(req, res) {
    try {
      const { mentorshipContractId, numSlots } = req.body;
      const { user } = req;
      const updatedCart = await CartService.addMentorshipListing(
        mentorshipContractId,
        user.accountId,
        numSlots
      );
      return apiResponse.result(
        res,
        { message: CART_RESPONSE.ADD_MENTORSHIP_TO_CART, updatedCart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.addMentorshipListing]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.STUDENT_DOES_NOT_EXIST,
        MENTORSHIP_ERRORS.CONTRACT_MISSING,
      ]);
    }
  }

  public static async updateMentorshipCartQuantity(req, res) {
    try {
      const { cartId, mentorshipListingId, numSlots } = req.query;

      const updatedCart = await CartService.updateMentorshipCartQuantity(
        cartId,
        mentorshipListingId,
        numSlots
      );
      return apiResponse.result(
        res,
        { message: CART_RESPONSE.UPDATE_QUANTITY, updatedCart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[cartController.updateMentorshipCartQuantity]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [CART_ERRORS.ITEM_MISSING]);
    }
  }

  public static async deleteItems(req, res) {
    try {
      const { courseIds, mentorshipListingIds } = req.body;
      const { user } = req;
      const updatedCart = await CartService.deleteItems(
        courseIds,
        mentorshipListingIds,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: CART_RESPONSE.DELETE_FROM_CART, updatedCart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.deleteItems]:' + e.message);
      if (e.message === ERRORS.STUDENT_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
    }
  }

  public static async viewCart(req, res) {
    try {
      const { user } = req;
      const cart = await CartService.viewCart(user.accountId);
      return apiResponse.result(
        res,
        { message: 'success', cart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.viewCart]:' + e.message);
      if (e.message === ERRORS.STUDENT_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }
}
