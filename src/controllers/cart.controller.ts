import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { CART_RESPONSE } from '../constants/successMessages';
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
        { message: CART_RESPONSE.ADD_TO_CART, updatedCart },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.addCourse]:' + e.message);
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

  public static async deleteItems(req, res) {
    try {
      const { courseIds, mentorshipContractIds } = req.body;
      const { user } = req;
      const updatedCart = await CartService.deleteItems(
        courseIds,
        mentorshipContractIds,
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
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async viewCart(req, res) {
    try {
      const { user } = req;
      const updatedCart = await CartService.viewCart(user.accountId);
      return apiResponse.result(
        res,
        { message: 'success', updatedCart },
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
