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

  accountIdQ: joi.object({
    accountId: joi.string().required(),
  }),

  changePassword: joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
    confirmPassword: joi.string().required(),
  }),

  updateUserB: joi.object({
    user: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
      status: joi.string(),
    }),
  }),
  updateUserAboutB: joi.object({
    about: joi.object({
      headline: joi.string(),
      bio: joi.string(),
    }),
  }),

  updateUserOccupationB: joi.object({
    occupation: joi.object({
      name: joi.string().required(),
    }),
  }),
};
