import joi from 'joi';

export default {
  addItemsB: joi.object({
    courseId: joi.string().required(),
  }),
  deleteItemsB: joi.object({
    courseIds: joi.array().items(joi.string()).required(),
    mentorshipContractIds: joi.array().items(joi.string()).required(),
  }),
};
