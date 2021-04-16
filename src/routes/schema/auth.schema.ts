import joi from 'joi';

export default {
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(8),
  }),

  register: joi.object({
    newUser: joi.object({
      username: joi.string().required(),
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required().min(8),
      confirmPassword: joi.string().required().min(8),
      isStudent: joi.boolean().required(),
    }),
  }),

  emailP: joi.object({
    email: joi.string().required(),
  }),

  resetPasswordB: joi.object({
    resetToken: joi.string().required(),
    accountId: joi.string().required(),
    newPassword: joi.string().required().min(8),
  }),

  changePassword: joi.object({
    oldPassword: joi.string().required().min(8),
    newPassword: joi.string().required().min(8),
    confirmPassword: joi.string().required().min(8),
  }),
};
