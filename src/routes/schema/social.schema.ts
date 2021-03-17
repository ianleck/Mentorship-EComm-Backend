import joi from 'joi';

export default {
    createPostB: joi.object({
        newPost: joi.object({
            content: joi.string().required(),
        }).required(),
      }),

      editPostB: joi.object({
        editedPost: joi.object({
            content: joi.string().required(),
        }).required(),
      }),

      postIdP: joi.object({
        postId: joi.string().required(),
      }),
};
