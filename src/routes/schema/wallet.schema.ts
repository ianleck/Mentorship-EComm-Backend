import joi from 'joi';
import { BILLING_STATUS, BILLING_TYPE } from '../../constants/enum';

export default {
  walletIdP: joi.object({
    walletId: joi.string().required(),
  }),
  walletBillingIdP: joi.object({
    walletId: joi.string().required(),
    billingId: joi.string().required(),
  }),
  billingIdP: joi.object({
    billingId: joi.string().required(),
  }),
  refundRequestQ: joi.object({
    contractId: joi.string().required(),
    contractType: joi.string().valid('COURSE', 'MENTORSHIP'),
  }),
  refundRequestIdP: joi.object({
    refundRequestId: joi.string().required(),
  }),
  billingFilterQ: joi.object({
    filter: joi.object({
      billingId: joi.string().optional(),
      receiverWalletId: joi.string().optional(),
      status: joi
        .string()
        .valid(...Object.values(BILLING_STATUS))
        .optional(),
      billingType: joi
        .string()
        .valid(...Object.values(BILLING_TYPE))
        .optional(),
      paypalPaymentId: joi.string().optional(),
    }),
  }),
};
