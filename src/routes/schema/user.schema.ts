import joi, { string } from 'joi';
import {
  PRIVACY_PERMISSIONS_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../../constants/enum';
import { ADMIN_VERIFIED_ENUM } from '../../constants/enum';

export default {
  accountIdP: joi.object({
    accountId: joi.string().required(),
  }),

  createExperienceB: joi.object({
    experience: joi.object({
      role: joi.string().required(),
      dateStart: joi.date().required(),
      dateEnd: joi.date().required(),
      description: joi.string().required(),
      companyName: joi.string().required(),
      companyUrl: joi.string().allow('', null),
    }),
  }),
  deleteExperienceParams: joi.object({
    accountId: joi.string().required(),
    experienceId: joi.string().required(),
  }),
  getFilter: joi.object({
    username: joi.string().optional(),
    firstName: joi.string().optional(),
    email: joi.string().optional(),
    contactNumber: joi.string().optional(),
    emailVerified: joi.boolean().optional(),
    status: joi
      .string()
      .valid(...Object.values(STATUS_ENUM))
      .optional(),
    userType: joi
      .string()
      .valid(...Object.values(USER_TYPE_ENUM))
      .optional(),
    adminVerified: joi
      .string()
      .valid(...Object.values(ADMIN_VERIFIED_ENUM))
      .optional(),
  }),
  updateExperienceB: joi.object({
    experience: joi.object({
      experienceId: joi.string().required(),
      role: joi.string().required(),
      dateStart: joi.date().required(),
      dateEnd: joi.date().required(),
      description: joi.string().required(),
      companyName: joi.string().required(),
      companyUrl: joi.string().allow('', null),
    }),
  }),
  updateUserB: joi.object({
    user: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
      headline: joi.string(),
      bio: joi.string(),
      chatPrivacy: joi
        .string()
        .valid(...Object.values(PRIVACY_PERMISSIONS_ENUM)),
      isPrivateProfile: joi.boolean(),
      personality: joi.string(),
      emailNotification: joi.boolean(),
      occupation: joi.string(),
      industry: joi.string(),
      adminVerified: joi.string().valid(...Object.values(ADMIN_VERIFIED_ENUM)),
      profileImgUrl: joi.string().optional(),
    }),
  }),
  updateUserOccupationB: joi.object({
    occupation: joi.object({
      name: joi.string().required(),
    }),
  }),
};
