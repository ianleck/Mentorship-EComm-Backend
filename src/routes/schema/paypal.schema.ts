import joi from 'joi';

export default {
  captureOrderQ: joi.object({
    paymentId: joi.string().required(),
    token: joi.string().required(),
    PayerID: joi.string().required(),
    cartId: joi.string().required(),
  }),
  payoutIdP: joi.object({
    payoutId: joi.string().required(),
  }),
  paymentIdP: joi.object({
    paymentId: joi.string().required(),
  }),
};
