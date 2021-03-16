import joi from 'joi';

export default {
  walletIdP: joi.object({
    walletId: joi.string().required(),
  }),
  billingIdP: joi.object({
    walletId: joi.string().required(),
    billingId: joi.string().required(),
  }),
};
