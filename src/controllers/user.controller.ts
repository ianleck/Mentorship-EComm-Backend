import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import UserService from '../services/user.service';
import logger from '../config/logger';

const passport = require('passport');

export class UserController {
  public static async changePassword(req, res) {
    const { accountId, userType } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
      await UserService.changePassword(
        accountId,
        userType,
        oldPassword,
        newPassword,
        confirmPassword
      );
      return apiResponse.result(
        res,
        { message: 'Successfully Changed Password' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.changePassword]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async login(req, res, next) {
    const { isStudent } = req.body;
    if (isStudent) {
      return passport.authenticate(
        'student-local',
        { session: false },
        (err, passportUser, info) => {
          if (err) {
            return next(err);
          }
          if (passportUser) {
            const user = passportUser;
            return req.logIn(user, function (err) {
              if (err) {
                return next(err);
              }
              return apiResponse.result(
                res,
                user.toAuthJSON(),
                httpStatusCodes.OK
              );
            });
          }

          return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, info);
        }
      )(req, res, next);
    } else {
      return passport.authenticate(
        'sensei-local',
        { session: false },
        (err, passportUser, info) => {
          if (err) {
            return next(err);
          }
          if (passportUser) {
            const user = passportUser;
            return apiResponse.result(
              res,
              user.toAuthJSON(),
              httpStatusCodes.OK
            );
          }
          return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, info);
        }
      )(req, res, next);
    }
  }

  public static async register(req, res) {
    const { newUser } = req.body;
    try {
      await UserService.register(newUser);
      return apiResponse.result(
        res,
        { message: 'Successfully Registered' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.register]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async deactivateUser(req, res) {
    const { userId, status } = req.params;
    try {
      await UserService.deactivateUser(userId, status);
      return apiResponse.result(
        res,
        { message: 'Account successfully deactivated' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deactivateUser]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
