import joi from 'joi';

export default {
  reviewB: joi.object({
    review: joi
      .object({
        rating: joi.number().required(),
        comment: joi.string(),
      })
      .required(),
  }),
};
