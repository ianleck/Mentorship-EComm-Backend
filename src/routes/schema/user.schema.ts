import joi, { string } from 'joi';
import { PRIVACY_PERMISSIONS_ENUM } from '../../constants/enum';
import { ADMIN_VERIFIED_ENUM } from '../../constants/enum';

export default {
  accountIdQ: joi.object({
    accountId: joi.string().required(),
  }),

  createExperienceB: joi.object({
    experience: joi.object({
      role: joi.string().required(),
      dateStart: joi.date().required(),
      dateEnd: joi.date().required(),
      description: joi.string().required(),
      companyName: joi.string().required(),
      companyUrl: joi.string(),
    }),
  }),
  deleteExperienceParams: joi.object({
    accountId: joi.string().required(),
    experienceId: joi.string().required(),
  }),
  updateExperienceB: joi.object({
    experience: joi.object({
      experienceId: joi.string().required(),
      role: joi.string().required(),
      dateStart: joi.date().required(),
      dateEnd: joi.date().required(),
      description: joi.string().required(),
      companyName: joi.string().required(),
      companyUrl: joi.string(),
    }),
  }),
  updateUserB: joi.object({
    user: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
      status: joi.string(),
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
    }),
  }),
  updateUserOccupationB: joi.object({
    occupation: joi.object({
      name: joi.string().required(),
    }),
  }),
};
