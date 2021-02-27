import joi from 'joi';

export default {
  mentorshipListingB: joi.object({
    newListing: joi.object({
      name: joi.string().required(),
      categories: joi.array().items(joi.string().required()).required(),
      description: joi.string().required(),
    }),
  }),

  mentorshipListingQ: joi.object({
    mentorshipListingId: joi.string().required(),
  }),

  mentorshipApplicationQ: joi.object({
    mentorshipListingId: joi.string().required(),
    accountId: joi.string().required(),
  }),

  mentorshipApplicationB: joi.object({
    statement: joi.string().required(),
  }),
};
