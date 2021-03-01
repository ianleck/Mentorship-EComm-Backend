import joi from 'joi';

export default {
  emailQ: joi.object({
    email: joi.string().email().required(),
    template: joi.string().required(),
  }),
};
