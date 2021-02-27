import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import AdminService from '../services/admin.service';
import apiResponse from '../utilities/apiResponse';
const passport = require('passport');
import { ADMIN_PERMISSION_ENUM } from '../constants/enum';

export class AdminController {
  public static async deactivateAdmin(req, res) {
    const { user } = req; // superadmin who requested to deactive account
    const { accountId } = req.params;

    if (
      user.accountId !== accountId &&
      user.permission !== ADMIN_PERMISSION_ENUM.SUPERADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }
    try {
      await AdminService.deactivateAdmin(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: 'Account successfully deactivated' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.deactivateAdmin]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getAdmin(req, res) {
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred

    /*
    If you are not user && not superadmin, will send error
    if you are user && not superadmin, will not send error
    if you are not user && superadmin, will not send error
    */

    if (
      user.accountId !== accountId &&
      user.permission !== ADMIN_PERMISSION_ENUM.SUPERADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

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
      logger.error('[adminController.getAdmin]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
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
      logger.error('[adminController.getAllAdmins]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
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
      logger.error('[adminController.getAllPendingSenseis]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
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
      logger.error('[adminController.getBannedStudents]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
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
      logger.error('[adminController.getBannedSenseis]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

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
      logger.error('[adminController.registerAdmin]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
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
        { message: 'Successfully Changed Password' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.resetPassword]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async updateAdmin(req, res) {
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred
    const { admin } = req.body;

    /*
    f you are not user && not superadmin, will send error
    if you are user && not superadmin, will not send error
    if you are not user && superadmin, will not send error
    */
    if (
      user.accountId !== accountId &&
      user.permission !== ADMIN_PERMISSION_ENUM.SUPERADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    } //end of check
    try {
      const user = await AdminService.updateAdmin(accountId, admin);
      apiResponse.result(
        res,
        { message: 'success', admin: user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.updateAdmin]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async updateAdminPermission(req, res) {
    const { user } = req; //user is the super admin who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updated
    const { admin } = req.body;
    try {
      const adminUpdated = await AdminService.updateAdminPermission(
        accountId,
        admin,
        user.accountId
      );
      apiResponse.result(
        res,
        { message: 'success', admin: adminUpdated },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.updateAdminPermission]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async verifySenseiProfile(req, res) {
    const { accountId } = req.params; //accountId of the sensei who is being verified
    const { sensei } = req.body;

    try {
      const senseiVerified = await AdminService.verifySenseiProfile(
        accountId,
        sensei
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          sensei: senseiVerified,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.verifySenseiProfile]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  /*

  public static async getMentorshipContracts(req, res) {
    try {
      const mentorshipContracts = await AdminService.getAllMentorshipContracts();
      return apiResponse.result(
        res,
        {
          message: 'success',
          mentorshipContracts,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getMentorshipContracts]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  */
}
