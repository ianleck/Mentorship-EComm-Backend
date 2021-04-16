import joi from 'joi';

export default {
  getSalesQ: joi.object({
    dateStart: joi.date().required(),
    dateEnd: joi.date().required(),
  }),
};
