import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { CONSULTATION_ERRORS } from '../constants/errors';
import { CONSULTATION_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import ConsultationService from '../services/consultation.service';
import apiResponse from '../utilities/apiResponse';

export class ConsultationController {
  public static async createConsultationSlot(req, res) {
    const { user } = req;
    const { newSlot } = req.body;

    try {
      await ConsultationService.createConsultationSlot(user.accountId, newSlot);

      const consultationSlots = await ConsultationService.viewAllConsultationSlots(
        user.accountId
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
    const { consultationId } = req.params;
    const { editedSlot } = req.body;
    try {
      await ConsultationService.editConsultationSlot(
        user.accountId,
        consultationId,
        editedSlot
      );
      const consultationSlots = await ConsultationService.viewAllConsultationSlots(
        user.accountId
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
        CONSULTATION_ERRORS.CONSULTATION_MISSING,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async deleteConsultationSlot(req, res) {
    const { user } = req;
    const { consultationId } = req.params;
    try {
      await ConsultationService.deleteConsultationSlot(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewAllConsultationSlots(
        user.accountId
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
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async viewAllConsultationSlots(req, res) {
    const { user } = req;
    const { consultationId } = req.params;
    try {
      await ConsultationService.deleteConsultationSlot(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewAllConsultationSlots(
        user.accountId
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
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  public static async registerForConsultation(req, res) {
    const { user } = req;
    const { consultationId } = req.params;
    try {
      await ConsultationService.deleteConsultationSlot(
        user.accountId,
        consultationId
      );
      const consultationSlots = await ConsultationService.viewAllConsultationSlots(
        user.accountId
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
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }
}
