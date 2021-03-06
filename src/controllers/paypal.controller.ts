import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import PaypalService from '../services/paypal.service';
import apiResponse from '../utilities/apiResponse';

export class PaypalController {
  public static async createOrder(req, res) {
    try {
      const { intent, value } = req.body;

      const response = await PaypalService.createOrder(intent, value);
      return apiResponse.result(res, { message: response }, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[PaypalController.createOrder]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
