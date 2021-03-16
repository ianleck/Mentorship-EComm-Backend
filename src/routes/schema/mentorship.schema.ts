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
};
