import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { CART_RESPONSE } from '../constants/successMessages';
import CartService from '../services/cart.service';
import apiResponse from '../utilities/apiResponse';

export class CartController {
  public static async addItem(req, res) {
    try {
      const { courseId } = req.params;
      const { user } = req;
      const updatedCart = await CartService.addItem(courseId, user.accountId);
      return apiResponse.result(
        res,
        { message: CART_RESPONSE.ADD_TO_CART }, // add returned cart too
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[cartController.addItem]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
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
