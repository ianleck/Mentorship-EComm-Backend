import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  COMMENT_ERRORS,
  COMPLAINT_ERRORS,
  RESPONSE_ERROR,
} from '../constants/errors';
import { COMPLAINT_RESPONSE } from '../constants/successMessages';
import ComplaintService from '../services/complaint.service';
import apiResponse from '../utilities/apiResponse';

export class ComplaintController {
  // ======================================== COMPLAINT REASON ========================================
  public static async createComplaintReason(req, res) {
    const { complaintReason } = req.body;
    try {
      const reason = await ComplaintService.createComplaintReason(
        complaintReason
      );
      return apiResponse.result(
        res,
        {
          message: COMPLAINT_RESPONSE.COMPLAINT_REASON_CREATE,
          reason,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[complainController.createComplaintReason]:' + e.message);
      if (e.message === COMPLAINT_ERRORS.COMPLAINT_REASON_EXISTS) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getComplaintReasons(req, res) {
    try {
      const reasons = await ComplaintService.getComplaintReasons();
      return apiResponse.result(
        res,
        {
          message: 'success',
          reasons,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[complainController.getComplaintReasons]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // =================================================== COMMENTS ===================================================
  public static async createCommentComplaint(req, res) {
    const { commentId } = req.params;
    const { accountId } = req.user;
    const { complaint } = req.body;
    try {
      const newComplaint = await ComplaintService.createCommentComplaint(
        commentId,
        accountId,
        complaint.complaintReasonId
      );
      return apiResponse.result(
        res,
        {
          message: COMPLAINT_RESPONSE.COMPLAINT_CREATE,
          complaint: newComplaint,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[complainController.createCommentComplaint]:' + e.message);
      if (
        e.message === COMMENT_ERRORS.COMMENT_MISSING ||
        e.message === COMPLAINT_ERRORS.COMPLAINT_ALREADY_EXISTS
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getComplaintsByFilter(req, res) {
    const filter = req.query;
    try {
      const complaints = await ComplaintService.getComplaintsByFilter(filter);
      return apiResponse.result(
        res,
        {
          message: 'success',
          complaints,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[complainController.getComplaintsByFilter]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async resolveComplaint(req, res) {
    const { complaintId } = req.params;
    try {
      await ComplaintService.resolveComplaint(complaintId);
      return apiResponse.result(
        res,
        {
          message: COMPLAINT_RESPONSE.COMPLAINT_RESOLVED,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[complainController.resolveComplaint]:' + e.message);
      if (e.message === COMPLAINT_ERRORS.COMPLAINT_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
