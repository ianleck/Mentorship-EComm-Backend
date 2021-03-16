import joi from 'joi';

export default {
  addCourseB: joi.object({
    courseId: joi.string().required(),
  }),

  addMentorshipListingB: joi.object({
    mentorshipContractId: joi.string().required(),
  }),

  courseAndContractIdsB: joi.object({
    courseIds: joi.array().items(joi.string()).required(),
    mentorshipListingIds: joi.array().items(joi.string()).required(),
  }),
};
