import AdminService from '../services/admin.service';
import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import {
  USER_TYPE_ENUM_OPTIONS,
  ADMIN_PERMISSION_ENUM_OPTIONS,
} from '../constants/enum';
import { Admin } from 'src/models/Admin';

export class AdminController {
  public static async registerAdmin(req, res) {
    const { user } = req; //user is the superadmin making the request to register
    const { newAdmin } = req.body;

    try {
      await AdminService.registerAdmin(newAdmin, user.accountId);
      return apiResponse.result(
        res,
        { message: 'Successfully Registered' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.registerAdmin]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async resetPassword(req, res) {
    const { accountId } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
      await AdminService.resetPassword(
        accountId,
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
      user.accountId != accountId &&
      user.permission != ADMIN_PERMISSION_ENUM_OPTIONS.SUPERADMIN
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
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred
    const { admin } = req.body;

    /*
    if you are not superadmin, will send error
    */
    if (user.permission != ADMIN_PERMISSION_ENUM_OPTIONS.SUPERADMIN) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    } //end of check
    try {
      const user = await AdminService.updateAdminPermission(accountId, admin);
      apiResponse.result(
        res,
        { message: 'success', admin: user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.updateAdminPermission]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getAdmin(req, res) {
    const { user } = req; //user is the user who is making the request
    const { accountId } = req.params; //accountId of the admin who is being updatred
    const { adminId } = req.body;

    /*
    If you are not user && not superadmin, will send error
    if you are user && not superadmin, will not send error
    if you are not user && superadmin, will not send error
    */

    if (
      user.accountId != accountId &&
      user.permission != ADMIN_PERMISSION_ENUM_OPTIONS.SUPERADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const admin = await AdminService.findAdminById(adminId);
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

  public static async getActiveStudents(req, res) {
    try {
      const students = await AdminService.getAllActiveStudents();
      return apiResponse.result(
        res,
        {
          message: 'success',
          students,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getActiveStudents]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async deactivateAdmin(req, res) {
    const { user } = req; // superadmin who requested to deactive account
    const { accountId } = req.params;

    if (
      user.accountId != accountId &&
      user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN
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
}
