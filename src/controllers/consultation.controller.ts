import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  CONSULTATION_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
} from '../constants/errors';
import { CONSULTATION_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import ConsultationService from '../services/consultation.service';
import apiResponse from '../utilities/apiResponse';

export class ConsultationController {
  public static async createConsultationSlot(req, res) {
    const { user } = req;
    const { newSlot } = req.body;
    const { dateStart, dateEnd } = req.query;

    try {
      await ConsultationService.createConsultationSlot(user.accountId, newSlot);

      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: CONSULTATION_RESPONSE.CONSULTATION_CREATE,
          consultationSlots,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error(
        '[consultationController.createConsultationSlot]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_CLASH,
      ]);
    }
  }

  public static async editConsultationSlot(req, res) {
    const { user } = req;
    const { consultationId, dateStart, dateEnd } = req.query;
    const { editedSlot } = req.body;
    try {
      await ConsultationService.editConsultationSlot(
        user.accountId,
        consultationId,
        editedSlot
      );
      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: CONSULTATION_RESPONSE.CONSULTATION_EDIT,
          consultationSlots,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[consultationController.editConsultationSlot]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_BOOKED,
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async deleteConsultationSlot(req, res) {
    const { user } = req;
    const { consultationId, dateStart, dateEnd } = req.query;
    try {
      await ConsultationService.deleteConsultationSlot(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: CONSULTATION_RESPONSE.CONSULTATION_DELETE,
          consultationSlots,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[consultationController.deleteConsultationSlot]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        MENTORSHIP_ERRORS.CONTRACT_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async viewFilteredConsultationSlots(req, res) {
    const { user } = req;
    const { dateStart, dateEnd } = req.query;
    try {
      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          consultationSlots,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[consultationController.viewFilteredConsultationSlots]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async viewConsultationById(req, res) {
    const { user } = req;
    const { consultationId } = req.params;
    try {
      const consultation = await ConsultationService.viewConsultationById(
        consultationId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          consultation,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async registerConsultation(req, res) {
    const { user } = req;
    const { consultationId, dateStart, dateEnd } = req.query;
    try {
      await ConsultationService.registerConsultation(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: CONSULTATION_RESPONSE.CONSULTATION_REGISTERED,
          consultationSlots,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[consultationController.registerConsultation]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        CONSULTATION_ERRORS.CONSULTATION_TAKEN,
        CONSULTATION_ERRORS.INSUFFICIENT_PASS,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async unregisterConsultation(req, res) {
    const { user } = req;
    const { consultationId, dateStart, dateEnd } = req.query;
    try {
      await ConsultationService.unregisterConsultation(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewFilteredConsultationSlots(
        user.accountId,
        dateStart,
        dateEnd
      );
      return apiResponse.result(
        res,
        {
          message: CONSULTATION_RESPONSE.CONSULTATION_UNREGISTERED,
          consultationSlots,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[consultationController.unregisterConsultation]:' + e.message
      );
      return Utility.apiErrorResponse(res, e, [
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        CONSULTATION_ERRORS.UNREGISTER_FAILURE,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }
}
