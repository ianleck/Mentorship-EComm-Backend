import joi from 'joi';
import { VISIBILITY_ENUM } from '../../constants/enum';
export default {
  mentorshipListingB: joi.object({
    mentorshipListing: joi
      .object({
        name: joi.string().required(),
        categories: joi.array().items(joi.string().required()).required(),
        description: joi.string().required(),
        priceAmount: joi.number().required(),
        visibility: joi
          .string()
          .valid(...Object.values(VISIBILITY_ENUM))
          .optional(),
      })
      .required(),
  }),

  mentorshipListingP: joi.object({
    mentorshipListingId: joi.string().required(),
  }),

  mentorshipContractP: joi.object({
    mentorshipContractId: joi.string().required(),
  }),

  mentorshipContractB: joi.object({
    statement: joi.string().required(),
  }),

  addTestimonialB: joi.object({
    newTestimonial: joi
      .object({
        body: joi.string().required(),
      })
      .required(),
  }),

  editTestimonialB: joi.object({
    editedTestimonial: joi
      .object({
        body: joi.string().required(),
      })
      .required(),
  }),

  testimonialP: joi.object({
    testimonialId: joi.string().required(),
  }),
  /*
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
  }),*/
};
