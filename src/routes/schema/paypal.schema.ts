import joi from 'joi';

export default {
  createOrderB: joi.object({
    intent: joi.string().required(),
    value: joi.string().required(),
  }),
};
