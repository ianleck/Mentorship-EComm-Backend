import joi from 'joi';
import { USER_TYPE_ENUM_OPTIONS } from 'src/constants/enum';

export default {
  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    isStudent: joi.boolean().required(),
  }),

  register: joi.object({
    newUser: joi.object({
      username: joi.string().required(),
      email: joi.string().required(),
      password: joi.string().required(),
      confirmPassword: joi.string().required(),
      isStudent: joi.boolean().required(),
    }),
  }),

  accountIdQ: joi.object({
    accountId: joi.string().required(),
  }),

  changePassword: joi.object({
    accountId: joi.string(), // attribute will be extracted from cookie instead in future releases
    userType: joi.string(), // attribute will be extracted from cookie instead in future releases
    oldPassword: joi.string().required(),
    newPassword: joi.string().required(),
    confirmPassword: joi.string().required(),
  }),

  getUser: joi.object({
    accountId: joi.string().required(),
    userType: joi.string().valid(...Object.values(USER_TYPE_ENUM_OPTIONS)),
  }),
};
