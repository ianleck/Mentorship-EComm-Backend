import joi from 'joi';
import { COMPLAINT_TYPE_ENUM } from '../../constants/enum';
export default {
  complaintB: joi.object({
    complaint: joi
      .object({
        complaintReasonId: joi.string().required(),
      })
      .required(),
  }),
  complaintP: joi.object({
    complaintId: joi.string().required(),
  }),
  complaintReasonB: joi.object({
    complaintReason: joi
      .object({
        reason: joi.string().required(),
        description: joi.string().allow('').required(),
      })
      .required(),
  }),
  getFilter: joi.object({
    accountId: joi.string().optional(),
    commentId: joi.string().optional(),
    complaintReasonId: joi.string().optional(),
    isResolved: joi.boolean().optional(),
    type: joi
      .string()
      .valid(...Object.values(COMPLAINT_TYPE_ENUM))
      .optional(),
  }),
};
