import SenseiService from '../services/sensei.service';
import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';

export class SenseiController {
  public static async updateSensei(req, res) {
    const { student } = req.body;
    try {
      await SenseiService.updateSensei(student);
      apiResponse.result(res, { message: 'success' }, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[studentController.updateStudent]' + e.toString());
      return apiResponse.error(res, 400, { message: e.toString() });
    }
  }
}
