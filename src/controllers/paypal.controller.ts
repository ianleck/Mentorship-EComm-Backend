import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import PaypalService from '../services/paypal.service';
import apiResponse from '../utilities/apiResponse';

export class PaypalController {
  public static async createOrder(req, res) {
    try {
      const { value, payment_method } = req.body;

      const response = await PaypalService.createOrder(value, payment_method);
      return apiResponse.result(res, { message: response }, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[PaypalController.createOrder]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
