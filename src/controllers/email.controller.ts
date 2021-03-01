import httpStatusCodes from 'http-status-codes';
import EmailService from '../services/email.service';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';

const EMAIL_SUCCESS = 'Email has been successfully sent';
export class EmailController {
  public static async sendEmail(req, res) {
    try {
      const { email, template } = req.query;

      await EmailService.sendEmail(email, template);
      return apiResponse.result(
        res,
        { message: EMAIL_SUCCESS },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[emailController.sendEmail]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
