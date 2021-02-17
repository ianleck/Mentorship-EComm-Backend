import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import UserService from '../services/user.service';
import logger from '../config/logger';
const passport = require('passport');

export class UserController {
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
            return apiResponse.result(
              res,
              { user: user.toAuthJSON() },
              httpStatusCodes.OK
            );
          }
          return apiResponse.error(res, 400, info);
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
          return apiResponse.error(res, 400, info);
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
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }
  public static async getUser(req, res) {
    const { userId, status } = req.body;
    try {
      const user = await UserService.findUserById(userId, status);
      return apiResponse.result(res, user, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[userController.getUser]:' + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }
}
