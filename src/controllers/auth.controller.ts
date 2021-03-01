import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import AuthService from '../services/auth.service';
import { AUTH_RESPONSE } from '../constants/successMessages';

const passport = require('passport');

export class AuthController {
  // ================================ USER AUTH ================================
  public static async changePassword(req, res) {
    const { accountId, userType } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
      await AuthService.changePassword(
        accountId,
        userType,
        oldPassword,
        newPassword,
        confirmPassword
      );
      return apiResponse.result(
        res,
        { message: AUTH_RESPONSE.SUCCESSFULLY_CHANGED_PASSWORD },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.changePassword]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async login(req, res, next) {
    return passport.authenticate(
      'jwt-local',
      { session: false },
      (err, passportUser, info) => {
        if (err) {
          return next(err);
        }
        if (passportUser) {
          const user = passportUser;
          return apiResponse.result(res, user.toAuthJSON(), httpStatusCodes.OK);
        }

        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, info);
      }
    )(req, res, next);
  }

  public static async register(req, res) {
    const { newUser } = req.body;
    try {
      const user = await AuthService.register(newUser);
      return apiResponse.result(
        res,
        user.toAuthJSON(),
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[userController.register]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async forgotPassword(req, res) {
    const { email } = req.params;
    try {
      await AuthService.forgotPassword(email);
      return apiResponse.result(
        res,
        { message: AUTH_RESPONSE.SUCCESSFULLY_REQUESTED_PASSWORD },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.forgotPassword]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }

  public static async resetPassword(req, res) {
    const { resetToken, accountId, newPassword } = req.body;
    try {
      await AuthService.resetPassword(resetToken, accountId, newPassword);
      return apiResponse.result(
        res,
        { message: AUTH_RESPONSE.SUCCESSFULLY_RESET_PASSWORD },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.resetPassword]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
