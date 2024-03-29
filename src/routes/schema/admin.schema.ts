import joi from 'joi';
import { ADMIN_ROLE_ENUM, ADMIN_VERIFIED_ENUM } from '../../constants/enum';

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

  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),

  updateAdmin: joi.object({
    admin: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),

  updateAdminRole: joi.object({
    admin: joi.object({
      role: joi.string().valid(...Object.values(ADMIN_ROLE_ENUM)),
    }),
  }),

  verifySensei: joi.object({
    sensei: joi.object({
      adminVerified: joi.string().valid(...Object.values(ADMIN_VERIFIED_ENUM)),
    }),
  }),
};
