import joi from "joi";
import { ADMIN_PERMISSION_ENUM_OPTIONS } from "../../constants/enum";

export default {
  registerAdmin: joi.object({
    newAdmin: joi.object({
      username: joi.string().required(),
      email: joi.string().required(),
      password: joi.string().required(),
      confirmPassword: joi.string().required(),
    }),
  }),

  adminIdQ: joi.object({
    adminId: joi.string().required(),
  }),

  updateAdmin: joi.object({
    admin: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
      permission: joi
        .string()
        .valid(...Object.values(ADMIN_PERMISSION_ENUM_OPTIONS)),
    }),
  }),

  getAdmin: joi.object({
    accountId: joi.string().required(),
  }),
};
