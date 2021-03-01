import joi from 'joi';

export default {
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),

  register: joi.object({
    newUser: joi.object({
      username: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      confirmPassword: joi.string().required(),
      isStudent: joi.boolean().required(),
    }),
  }),

  emailQ: joi.object({
    email: joi.string().required(),
  }),

  resetPasswordB: joi.object({
    resetToken: joi.string().required(),
    accountId: joi.string().required(),
    newPassword: joi.string().required(),
  }),

  changePassword: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
    confirmPassword: joi.string().required(),
  }),
};
