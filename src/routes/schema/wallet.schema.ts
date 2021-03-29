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

  billingFilterB: joi.object({
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
    deleted: joi.boolean().optional(),
  }),
};
