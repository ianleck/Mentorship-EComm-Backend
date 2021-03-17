import joi from 'joi';

export default {
    createPostB: joi.object({
        newPost: joi.object({
          content: joi.string().required(),
        }).required(),
      }),
};
