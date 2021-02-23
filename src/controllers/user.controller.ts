import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import UserService from '../services/user.service';
import logger from '../config/logger';
import { USER_TYPE_ENUM_OPTIONS } from '../constants/enum';

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

  public static async deactivateUser(req, res) {
    const _user = req.user;
    const { accountId } = req.params;

    if (
      _user.accountId != accountId &&
      _user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }
    try {
      await UserService.deactivateUser(accountId);
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

  public static async getAllActiveStudents(req, res) {
    try {
      const students = await UserService.getAllActiveStudents();
      return apiResponse.result(
        res,
        {
          message: 'success',
          students,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getAllActiveStudents]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getAllActiveSenseis(req, res) {
    try {
      const senseis = await UserService.getAllActiveSenseis();
      return apiResponse.result(
        res,
        {
          message: 'success',
          senseis,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getAllActiveSenseis]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getUser(req, res) {
    const { accountId } = req.params;
    try {
      const user = await UserService.findUserById(accountId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          user,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getUser]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
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
      const user = await UserService.register(newUser);
      return apiResponse.result(res, user.toAuthJSON(), httpStatusCodes.OK);
    } catch (e) {
      logger.error('[userController.register]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async updateUser(req, res) {
    const _user = req.user;
    const { accountId } = req.params;
    const { user } = req.body;

    // check if user is updating his/her own account
    if (_user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const userEntity = await UserService.updateUser(accountId, user);
      apiResponse.result(
        res,
        { message: 'success', student: userEntity },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateUser]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async updateUserAbout(req, res) {
    const _user = req.user;
    const { accountId } = req.params;
    const { about } = req.body;

    // check if user is updating his/her own account
    if (_user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const userEntity = await UserService.updateUserAbout(accountId, about);
      apiResponse.result(
        res,
        { message: 'success', student: userEntity },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateUserAbout]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
