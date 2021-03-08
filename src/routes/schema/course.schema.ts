import joi from 'joi';

export default {
  createCourseB: joi.object({
    newCourse: joi.object({
      name: joi.string().required(),
      description: joi.string().required(),
      priceAmount: joi.number().required(),
      currency: joi.string().required(),
      parentCourseId: joi.string().allow('', null),
      categories: joi.array().items(joi.string().required()).required(),
    }),
  }),
  createContractP: joi.object({
    courseId: joi.string().required(),
  }),
};
