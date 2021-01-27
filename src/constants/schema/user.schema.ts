import joi from 'joi';

export default {
  helloWorldQuery: joi.object({
    teacher: joi.string().email().required()
  }),
  login: joi.object({
    user: {
      username: joi.string(),
      password: joi.string()
    }
  })
};
