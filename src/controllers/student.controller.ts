import StudentService from '../services/student.service';
import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import { USER_TYPE_ENUM_OPTIONS } from '../constants/enum';

export class StudentController {
  // public static async createStudent(req, res) {
  //     const { newStudent } = req.body;
  //     try {
  //         await StudentService.createStudent(newStudent);
  //         apiResponse.result(res, {message: 'success'}, httpStatusCodes.OK);
  //     } catch(e) {
  //         logger.error('[studentController.updateStudent]' + e.toString());
  //         return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {message: e.toString()});
  //     }
  // }

  public static async updateStudent(req, res) {
    const { user } = req;
    const { accountId } = req.params;
    const { student } = req.body;

    // check if user is updating his/her own account
    if (user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const user = await StudentService.updateStudent(accountId, student);
      apiResponse.result(
        res,
        { message: 'success', student: user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[studentController.updateStudent]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getStudent(req, res) {
    const { user } = req;
    const { accountId } = req.params;

    if (
      user.accountId != accountId ||
      user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const user = await StudentService.findStudentById(accountId);
      return apiResponse.result(res, user, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[studentController.getStudent]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async deactivateStudent(req, res) {
    const { user } = req;
    const { accountId } = req.params;

    if (
      user.accountId != accountId ||
      user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }
    try {
      await StudentService.deactivateStudent(accountId);
      return apiResponse.result(
        res,
        { message: 'Account successfully deactivated' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[studentController.deactivateUser]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
