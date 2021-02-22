import SenseiService from '../services/sensei.service';
import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import logger from '../config/logger';
import { USER_TYPE_ENUM_OPTIONS } from '../constants/enum';

export class SenseiController {
  public static async getAllActiveSenseis(req, res) {
    try {
      const senseis = await SenseiService.getAllActiveSenseis();
      return apiResponse.result(
        res,
        {
          message: 'success',
          senseis,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[adminController.getAllActiveSenseis]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async updateSensei(req, res) {
    const { user } = req;
    const { accountId } = req.params;
    const { sensei } = req.body;

    // check if user is updating his/her own account
    if (user.accountId != accountId) {
      return apiResponse.error(res, httpStatusCodes.UNAUTHORIZED, {
        message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      });
    }

    try {
      const updatedSensei = await SenseiService.updateSensei(sensei);
      return apiResponse.result(
        res,
        {
          message: 'Sensei has been successfully updated',
          sensei: updatedSensei,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[senseiController.updateSensei]' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async getSensei(req, res) {
    const { accountId } = req.params;

    try {
      const user = await SenseiService.findSenseiById(accountId);
      return apiResponse.result(res, user, httpStatusCodes.OK);
    } catch (e) {
      logger.error('[senseiController.getSensei]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }

  public static async deactivateSensei(req, res) {
    const { user } = req;
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
      await SenseiService.deactivateSensei(accountId);
      return apiResponse.result(
        res,
        { message: 'Account successfully deactivated' },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[senseiController.deactivateUser]:' + e.toString());
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.toString(),
      });
    }
  }
}
