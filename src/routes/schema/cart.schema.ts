import joi from 'joi';

export default {
  cartItemsP: joi.object({
    courseId: joi.string().required(),
  }),
};
