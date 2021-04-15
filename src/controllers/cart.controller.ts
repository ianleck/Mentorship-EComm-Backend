import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  CART_ERRORS,
  COURSE_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
} from '../constants/errors';
import { CART_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import CartService from '../services/cart.service';
import apiResponse from '../utilities/apiResponse';

export class CartController {
  // ======================================== CART ========================================

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
      return Utility.apiErrorResponse(res, e, [ERRORS.STUDENT_DOES_NOT_EXIST]);
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
      return Utility.apiErrorResponse(res, e, [ERRORS.STUDENT_DOES_NOT_EXIST]);
    }
  }

  // ======================================== UPSELL ========================================

  public static async upsellOnCourses(req, res) {
    try {
      const { user } = req;
      const { courseId } = req.params;
      const cart = await CartService.upsellOnCourses(courseId, user.accountId);
      return apiResponse.result(
        res,
        { message: 'success', cart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.upsellOnCourses]:' + e.message);
      return Utility.apiErrorResponse(res, e, []);
    }
  }

  public static async upsellOnMentorships(req, res) {
    try {
      const { user } = req;
      const { mentorshipListingId } = req.params;
      const cart = await CartService.upsellOnMentorships(
        mentorshipListingId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: 'success', cart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.upsellOnMentorships]:' + e.message);
      return Utility.apiErrorResponse(res, e, []);
    }
  }

  public static async upsellCheckout(req, res) {
    try {
      const { user } = req;
      const cart = await CartService.upsellCheckout(user.accountId);
      return apiResponse.result(
        res,
        { message: 'success', cart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.upsellCheckout]:' + e.message);
      return Utility.apiErrorResponse(res, e, []);
    }
  }
}
