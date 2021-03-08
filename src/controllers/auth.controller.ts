import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { AUTH_ERRORS, ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { AUTH_RESPONSE } from '../constants/successMessages';
import AuthService from '../services/auth.service';
import apiResponse from '../utilities/apiResponse';

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
      logger.error('[authController.changePassword]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === AUTH_ERRORS.OLD_PASSWORD_INCORRECT ||
        e.message === AUTH_ERRORS.NEW_PASSWORD_MISMATCH ||
        e.message === AUTH_ERRORS.NEW_PASSWORD_CANNOT_BE_OLD_PASSWORD
      ) {
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
      logger.error('[authController.register]:' + e.message);
      if (
        e.message === AUTH_ERRORS.USER_EXISTS ||
        e.message === AUTH_ERRORS.NEW_PASSWORD_MISMATCH
      ) {
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
      logger.error('[authController.forgotPassword]:' + e.message);
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
      logger.error('[authController.resetPassword]:' + e.message);
      if (
        e.message === AUTH_ERRORS.INVALID_TOKEN ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
      ) {
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
