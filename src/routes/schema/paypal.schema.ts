import joi from 'joi';

export default {
  captureOrderQ: joi.object({
    paymentId: joi.string().required(),
    token: joi.string().required(),
    PayerID: joi.string().required(),
  }),
  payoutIdP: joi.object({
    payoutId: joi.string().required(),
  }),
};
