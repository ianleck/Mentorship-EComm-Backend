import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { STATUS_ENUM } from '../constants/enum';
import { AUTH_ERRORS, ERRORS, RESPONSE_ERROR } from '../constants/errors';
import {
  ADMIN_RESPONSE,
  AUTH_RESPONSE,
  USER_RESPONSE,
} from '../constants/successMessages';
import AdminService from '../services/admin.service';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';

const passport = require('passport');

export class AdminController {
  // ======================================== ADMIN AUTH ========================================
  public static async login(req, res, next) {
    return passport.authenticate(
      'admin-local',
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

  public static async registerAdmin(req, res) {
    const { user } = req; //user is the superadmin making the request to register
    const { newAdmin } = req.body;

    try {
      const admin = await AdminService.registerAdmin(newAdmin, user.accountId);
      return apiResponse.result(res, admin.toAuthJSON(), httpStatusCodes.OK);
    } catch (e) {
      logger.error('[adminController.registerAdmin]:' + e.message);
      if (e.message === AUTH_ERRORS.ADMIN_EXISTS) {
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

  //done by super admin A for admin B
  public static async resetPassword(req, res) {
    const { accountId } = req.params; //accountId of the admin who is changing password
    const { newPassword, confirmPassword } = req.body;
    try {
      await AdminService.resetPassword(accountId, newPassword, confirmPassword);
      return apiResponse.result(
        res,
        { message: AUTH_RESPONSE.SUCCESSFULLY_CHANGED_PASSWORD },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.resetPassword]:' + e.message);
      if (e.message === AUTH_ERRORS.NEW_PASSWORD_MISMATCH) {
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
  // ======================================== ADMIN ========================================
  public static async updateAdmin(req, res) {
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred
    const { admin } = req.body;
    try {
      const user = await AdminService.updateAdmin(accountId, admin);
      apiResponse.result(
        res,
        { message: ADMIN_RESPONSE.ADMIN_UPDATE, admin: user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.updateAdmin]' + e.message);
      if (e.message === ERRORS.ADMIN_DOES_NOT_EXIST) {
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

  public static async updateAdminRole(req, res) {
    const { user } = req; //user is the super admin who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updated
    const { admin } = req.body;
    try {
      const adminUpdated = await AdminService.updateAdminRole(
        accountId,
        admin,
        user.accountId
      );
      apiResponse.result(
        res,
        { message: ADMIN_RESPONSE.ADMIN_ROLE_UPDATE, admin: adminUpdated },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.updateAdminRole]' + e.message);
      if (e.message === ERRORS.ADMIN_DOES_NOT_EXIST) {
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

  public static async deactivateAdmin(req, res) {
    const { user } = req; // superadmin who requested to deactive account
    const { accountId } = req.params;

    try {
      await AdminService.deactivateAdmin(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: ADMIN_RESPONSE.ADMIN_DEACTIVATE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.deactivateAdmin]:' + e.message);
      if (e.message === ERRORS.ADMIN_DOES_NOT_EXIST) {
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

  public static async getAdmin(req, res) {
    const { accountId } = req.params; //accountId of the admin who is being updatred

    /*
    If you are not user && not superadmin, will send error
    if you are user && not superadmin, will not send error
    if you are not user && superadmin, will not send error
    */

    try {
      const admin = await AdminService.findAdminById(accountId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          admin,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getAdmin]:' + e.message);
      if (e.message === ERRORS.ADMIN_DOES_NOT_EXIST) {
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

  public static async getAllAdmins(req, res) {
    try {
      const admins = await AdminService.getAllAdmins();
      return apiResponse.result(
        res,
        {
          message: 'success',
          admins,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getAllAdmins]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== USERS ========================================
  public static async acceptSenseiProfile(req, res) {
    const { accountId } = req.params; //accountId of the sensei who is being verified

    try {
      const senseiVerified = await AdminService.acceptSenseiProfile(accountId);
      return apiResponse.result(
        res,
        {
          message: ADMIN_RESPONSE.SENSEI_ACCEPT,
          sensei: senseiVerified,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.acceptSenseiProfile]:' + e.message);
      if (e.message === ERRORS.SENSEI_NOT_PENDING) {
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

  public static async rejectSenseiProfile(req, res) {
    const { accountId } = req.params; //accountId of the sensei who is being verified

    try {
      const senseiVerified = await AdminService.rejectSenseiProfile(accountId);
      return apiResponse.result(
        res,
        {
          message: ADMIN_RESPONSE.SENSEI_REJECT,
          sensei: senseiVerified,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.rejectSenseiProfile]:' + e.message);
      if (e.message === ERRORS.SENSEI_NOT_PENDING) {
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

  public static async toggleUserStatus(req, res) {
    const { accountId } = req.params;
    try {
      const updatedUser = await UserService.toggleUserStatus(accountId);
      return apiResponse.result(
        res,
        {
          message:
            updatedUser.status === STATUS_ENUM.ACTIVE
              ? USER_RESPONSE.USER_UNBANNED
              : USER_RESPONSE.USER_BANNED,
          user: updatedUser,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.toggleUserStatus]:' + e.message);
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

  public static async getUsersByFilter(req, res) {
    const filter = req.query;
    try {
      const users = await UserService.getUsersByFilter(filter);
      return apiResponse.result(
        res,
        {
          message: 'success',
          users,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getUsersByFilter]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getAllPendingSenseis(req, res) {
    try {
      const senseis = await AdminService.getAllPendingSenseis();
      return apiResponse.result(
        res,
        {
          message: 'success',
          senseis,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getAllPendingSenseis]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getBannedStudents(req, res) {
    try {
      const students = await AdminService.getAllBannedStudents();
      return apiResponse.result(
        res,
        {
          message: 'success',
          students,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getBannedStudents]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getBannedSenseis(req, res) {
    try {
      const senseis = await AdminService.getAllBannedSenseis();
      return apiResponse.result(
        res,
        {
          message: 'success',
          senseis,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getBannedSenseis]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
