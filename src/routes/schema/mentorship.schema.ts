import joi from 'joi';

export default {
  mentorshipListingB: joi.object({
    name: joi.string().required(),
    categories: joi
      .array()
      .items({
        categoryIds: joi.string().required(),
      })
      .required(),
    description: joi.string().required(),
  }),

  mentorshipListingQ: joi.object({
    mentorshipListingId: joi.string().required(),
  }),

  mentorshipApplicationQ: joi.object({
    mentorshipListingId: joi.string().required(),
    accountId: joi.string().required(),
  }),

  mentorshipContractQ: joi.object({
    mentorshipContractId: joi.string().required(),
  }),

  userIdQ: joi.object({
    accountId: joi.string().required(),
  }),
};
