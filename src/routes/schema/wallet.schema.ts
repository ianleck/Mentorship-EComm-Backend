import joi from 'joi';

export default {
  walletIdP: joi.object({
    accountId: joi.string().required(),
    walletId: joi.string().required(),
  }),
};
