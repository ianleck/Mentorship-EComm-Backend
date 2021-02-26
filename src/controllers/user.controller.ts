import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import UserService from '../services/user.service';
import logger from '../config/logger';
import { USER_TYPE_ENUM } from '../constants/enum';

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

  public static async createExperience(req, res) {
    const _user = req.user;
    const { accountId } = req.params;
    const { experience } = req.body;

    // if request.user is sending a request to update an account that is not his/hers, return unauthorized
    if (_user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const exp = await UserService.createExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: 'Successfully Created Experience', experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.addExperience]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: 'Unable to create new experience',
      });
    }
  }

  public static async deactivateUser(req, res) {
    const _user = req.user;
    const { accountId } = req.params;

    if (
      _user.accountId != accountId &&
      _user.userType != USER_TYPE_ENUM.ADMIN
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

  public static async deleteExperience(req, res) {
    const _user = req.user;
    const { accountId, experienceId } = req.params;

    // if request.user is sending a request to update an account that is not his/hers, return unauthorized
    if (_user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      await UserService.deleteExperience(experienceId);
      return apiResponse.result(
        res,
        { message: 'Successfully Deleted Experience' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deleteExperience]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: 'Unable to delete experience',
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
      return apiResponse.result(
        res,
        user.toAuthJSON(),
        httpStatusCodes.CREATED
      );
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

  public static async updateExperience(req, res) {
    const _user = req.user;
    const { accountId } = req.params;
    const { experience } = req.body;

    // if request.user is sending a request to update an account that is not his/hers, return unauthorized
    if (_user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const exp = await UserService.updateExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: 'Successfully Updated Experience', experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateExperience]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: 'Unable to update experience',
      });
    }
  }

  //   public static async updateUserOccupation(req, res) {
  //     const _user = req.user;
  //     const { accountId } = req.params;
  //     const { occupation } = req.body;

  //     // check if user is updating his/her own account
  //     if (_user.accountId != accountId) {
  //       return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
  //         message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
  //       });
  //     }

  //     try {
  //       const userEntity = await UserService.updateUserOccupation(
  //         accountId,
  //         occupation
  //       );
  //       apiResponse.result(
  //         res,
  //         { message: 'success', student: userEntity },
  //         httpStatusCodes.OK
  //       );
  //     } catch (e) {
  //       logger.error('[userController.updateUserAbout]' + e.toString());
  //       return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
  //         message: e.toString(),
  //       });
  //     }
  //   }
}
