import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR } from '../constants/errors';
import { Category } from '../models/Category';
import apiResponse from '../utilities/apiResponse';

export class CategoryController {
  public static async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      return apiResponse.result(
        res,
        {
          message: 'success',
          categories,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[categoryController.getAllCategories]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
