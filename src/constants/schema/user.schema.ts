import joi from 'joi';

export default {
  helloWorldQuery: joi.object({
    teacher: joi.string().email().required()
  })
};
