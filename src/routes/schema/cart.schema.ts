import joi from 'joi';

export default {
  addCourseB: joi.object({
    courseId: joi.string().required(),
  }),

  addMentorshipListingB: joi.object({
    numSlots: joi.string().required(),
    mentorshipContractId: joi.string().required(),
  }),

  courseAndContractIdsB: joi.object({
    courseIds: joi.array().items(joi.string()).required(),
    mentorshipListingIds: joi.array().items(joi.string()).required(),
  }),

  updateMentorshipCartQ: joi.object({
    cartId: joi.string().required(),
    mentorshipListingId: joi.string().required(),
    numSlots: joi.string().required(),
  }),
};
