import joi from 'joi';

export default {
  mentorshipListingB: joi.object({
    mentorshipListing: joi.object({
      name: joi.string().required(),
      categories: joi.array().items(joi.string().required()).required(),
      description: joi.string().required(),
    }),
  }),

  mentorshipListingQ: joi.object({
    mentorshipListingId: joi.string().required(),
  }),

  mentorshipContractQ: joi.object({
    mentorshipContractId: joi.string().required(),
  }),

  mentorshipContractB: joi.object({
    statement: joi.string().required(),
  }),
};
