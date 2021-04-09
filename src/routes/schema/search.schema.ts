import joi from 'joi';

export default {
  filterSearch: joi.object({
    query: joi.string().optional(),
  }),
};
