import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR } from '../constants/errors';
import EmailService from '../services/email.service';
import apiResponse from '../utilities/apiResponse';

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
