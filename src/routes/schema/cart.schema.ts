import joi from 'joi';

export default {
  addItemsB: joi.object({
    courseId: joi.string().required(),
  }),
  courseAndContractIdsB: joi.object({
    courseIds: joi.array().items(joi.string()).required(),
    mentorshipListingIds: joi.array().items(joi.string()).required(),
  }),
};
