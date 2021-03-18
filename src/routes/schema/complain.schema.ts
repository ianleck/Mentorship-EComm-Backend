import joi from 'joi';

export default {
  complainB: joi.object({
    complain: joi
      .object({
        complainReasonId: joi.string().required(),
      })
      .required(),
  }),
};
