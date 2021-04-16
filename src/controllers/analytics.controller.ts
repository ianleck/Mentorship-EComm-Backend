import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { RESPONSE_ERROR } from '../constants/errors';
import AnalyticsService from '../services/analytics.service';
import apiResponse from '../utilities/apiResponse';

export class AnalyticsController {
  public static async getMentorshipSales(req, res) {
    const { accountId, userType } = req.user;
    const { dateStart, dateEnd } = req.query;
    try {
      const sales = await AnalyticsService.getMentorshipSales(
        accountId,
        userType,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          sales,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[analyticsController.getMentorshipSales]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getCourseSales(req, res) {
    const { accountId, userType } = req.user;
    const { dateStart, dateEnd } = req.query;
    try {
      const sales = await AnalyticsService.getCourseSales(
        accountId,
        userType,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          sales,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[analyticsController.getCourseSales]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getListingApplications(req, res) {
    const { accountId } = req.user;
    const { dateStart, dateEnd } = req.query;
    try {
      const all = await AnalyticsService.getAllApplications(
        accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          all,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[analyticsController.getListingApplications]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getCourseCategorySales(req, res) {
    const { dateStart, dateEnd } = req.query;
    try {
      const sales = await AnalyticsService.getCourseCategorySales(
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          sales,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[analyticsController.getCourseCategorySales]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getMentorshipCategorySales(req, res) {
    const { dateStart, dateEnd } = req.query;
    try {
      const sales = await AnalyticsService.getMentorshipCategorySales(
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          sales,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[analyticsController.getMentorshipCategorySales]:' + e.message
      );
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
