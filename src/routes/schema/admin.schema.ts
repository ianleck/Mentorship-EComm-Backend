import joi from 'joi';
import { ADMIN_PERMISSION_ENUM_OPTIONS } from '../../constants/enum';

interface adminObj {
  accountId: string;
  firstName: string;
  lastName: string;
  contactNumber: number;
}

interface adminProfile {
  adminObj: adminObj;
}

export default {
  registerAdmin: joi.object({
    newAdmin: joi.object({
      username: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      confirmPassword: joi.string().required(),
    }),
  }),

  resetPassword: joi.object({
    newPassword: joi.string().required(),
    confirmPassword: joi.string().required(),
  }),

  adminIdQ: joi.object({
    accountId: joi.string().required(),
  }),

  senseiIdQ: joi.object({
    accountId: joi.string().required(),
  }),

  updateAdmin: joi.object({
    admin: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),

  updateAdminPermission: joi.object({
    admin: joi.object({
      permission: joi
        .string()
        .valid(...Object.values(ADMIN_PERMISSION_ENUM_OPTIONS)),
    }),
  }),
};
