import joi from 'joi';

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
};
