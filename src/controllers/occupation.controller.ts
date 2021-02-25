import httpStatusCodes from 'http-status-codes';
import OccupationService from '../services/occupation.service';
import logger from '../config/logger';
import apiResponse from '../utilities/apiResponse';

export class OccupationController {
  public static async getAllOccupation(req, res) {
    try {
      const occupations = await OccupationService.getAllOccupation();
      return apiResponse.result(
        res,
        { message: 'success', occupations },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[occupationController.getAllOccupation]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
