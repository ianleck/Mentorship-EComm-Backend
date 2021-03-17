import joi from 'joi';

export default {

    commentIdP: joi.object({
        commentId: joi.string().required(),
      }),

    createLessonCommentB: joi.object({
      comment: joi
        .object({
          body: joi.string().required(),
        })
        .required(),
    }),

    createPostCommentB: joi.object({
        comment: joi
          .object({
            body: joi.string().required(),
          })
          .required(),
      }),

      editPostCommentB: joi.object({
        editedComment: joi
          .object({
            body: joi.string().required(),
          })
          .required(),
      }),




}