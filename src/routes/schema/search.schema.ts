import joi from 'joi';

export default {
  getFilter: joi.object({
    username: joi.string().optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    title: joi.string().optional(), //course title
    name: joi.string().optional(), //mentorship listing name
  }),
};
