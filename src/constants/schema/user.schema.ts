import joi from 'joi';

export default {
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    isStudent: joi.boolean().required()
  }),
  register: joi.object({
    username: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required(),
    isStudent: joi.boolean().required()
  })
};
