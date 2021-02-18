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
    const { accountId } = req.query;
    const { student } = req.body;

    console.log('user =', user);
    console.log('accountId =', accountId);
    console.log('user.accountId == accountId =', user.accountId == accountId);
    // check if user is updating his/her own account or if it is an admin who is updating the account
    if (
      user.accountId != accountId ||
      user.userType == USER_TYPE_ENUM_OPTIONS.ADMIN
    ) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    } // end check

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
}
