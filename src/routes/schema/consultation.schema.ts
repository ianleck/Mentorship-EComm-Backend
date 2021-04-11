import joi from 'joi';

export default {
  createConsultationB: joi.object({
    newSlot: joi
      .object({
        title: joi.string().required(),
        mentorshipListingId: joi.string().required(),
        startTime: joi.date().required(),
        endTime: joi.date().required(),
      })
      .required(),
  }),

  editConsultationB: joi.object({
    editedSlot: joi
      .object({
        title: joi.string().optional(),
        mentorshipListingId: joi.string().optional(),
        timeStart: joi.date().optional(),
        timeEnd: joi.date().optional(),
      })
      .required(),
  }),

  consultationIdP: joi.object({
    consultationId: joi.string().required(),
  }),
};
