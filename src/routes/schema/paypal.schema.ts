import joi from 'joi';

export default {
  createOrderB: joi.object({
    value: joi.string().required(),
    payment_method: joi.string().required(),
  }),
};
