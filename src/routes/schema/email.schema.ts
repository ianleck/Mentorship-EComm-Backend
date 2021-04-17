import joi from 'joi';

export default {
  emailQ: joi.object({
    email: joi.string().email().required(),
    template: joi.string().required(),
  }),
  emailB: joi.object({
    additional: joi
      .object({
        mentorName: joi.string().optional(),
        numSlots: joi.string().optional(),
        duration: joi.string().optional(),
        message: joi.string().optional(),
        url: joi.string().optional(),
        commentBody: joi.string().optional(),
        announcementContent: joi.string().optional(),
        announcementTitle: joi.string().optional(),
        title: joi.string().optional(),
      })
      .required(),
  }),
};
