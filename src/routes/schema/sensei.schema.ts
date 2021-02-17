import joi from 'joi';

export default {
  updateSensei: joi.object({
    sensei: joi.object({
      accountId: joi.string().required(),
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),
};
