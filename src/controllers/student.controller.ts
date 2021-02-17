import StudentService from "../services/student.service";
import httpStatusCodes from 'http-status-codes';
import apiResponse from "../utilities/apiResponse";
import logger from "../config/logger";

export class StudentController {
    // public static async createStudent(req, res) {
    //     const { newStudent } = req.body;
    //     try {
    //         await StudentService.createStudent(newStudent);
    //         apiResponse.result(res, {message: 'success'}, httpStatusCodes.OK);
    //     } catch(e) {
    //         logger.error('[studentController.updateStudent]' + e.toString());
    //         return apiResponse.error(res, 400, {message: e.toString()});
    //     }
    // }

    public static async updateStudent(req, res) {
        const { accountId } = req.query;
        const { student } = req.body;
        try {
            await StudentService.updateStudent(accountId, student);
            apiResponse.result(res, {message: 'success'}, httpStatusCodes.OK);
        } catch(e) {
            logger.error('[studentController.updateStudent]' + e.toString());
            return apiResponse.error(res, 400, {message: e.toString()});
        }
    }
}