import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR, SOCIAL_ERRORS } from '../constants/errors';
import { USER_RESPONSE } from '../constants/successMessages';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';
export class UserController {
  // ================================ USER ================================

  public static async deactivateUser(req, res) {
    const { accountId } = req.params;

    try {
      await UserService.deactivateUser(accountId);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.USER_DEACTIVATE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deactivateUser]:' + e.message);
      if (e.message === ERRORS.STUDENT_DOES_NOT_EXIST) {
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

  public static async getUserProfile(req, res) {
    const { accountId } = req.params;
    const { userReq } = req;
    try {
      const { user, isBlocking } = await UserService.findUserById(
        accountId,
        userReq.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          user,
          isBlocking,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getUser]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === SOCIAL_ERRORS.PRIVATE_USER
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
      logger.error('[userController.getAllActiveStudents]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
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
      logger.error('[userController.getAllActiveSenseis]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateUser(req, res) {
    const { accountId } = req.params;
    const { user } = req.body;

    try {
      const userEntity = await UserService.updateUser(accountId, user);
      apiResponse.result(
        res,
        { message: USER_RESPONSE.USER_UPDATE, user: userEntity },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateUser]' + e.message);
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

  // ================================ USER EXPERIENCE ================================

  public static async createExperience(req, res) {
    const { accountId } = req.params;
    const { experience } = req.body;

    try {
      const exp = await UserService.createExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_CREATE, experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.createExperience]:' + e.message);
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

  public static async deleteExperience(req, res) {
    const { experienceId } = req.params;

    try {
      await UserService.deleteExperience(experienceId);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deleteExperience]:' + e.message);
      if (e.message === ERRORS.EXPERIENCE_DOES_NOT_EXIST) {
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

  public static async updateExperience(req, res) {
    const { accountId } = req.params;
    const { experience } = req.body;

    try {
      const exp = await UserService.updateExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_UPDATE, experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateExperience]:' + e.message);
      if (
        e.message === ERRORS.EXPERIENCE_DOES_NOT_EXIST ||
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
