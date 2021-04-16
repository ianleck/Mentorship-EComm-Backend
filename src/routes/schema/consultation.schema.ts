import joi from 'joi';

export default {
  createConsultationB: joi.object({
    newSlot: joi
      .object({
        title: joi.string().required(),
        mentorshipListingId: joi.string().required(),
        timeStart: joi.date().required(),
        timeEnd: joi.date().required(),
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
  viewRangeQ: joi.object({
    dateStart: joi.date().required(),
    dateEnd: joi.date().required(),
    accountId: joi.string().optional(),
  }),
  consultationIdQ: joi.object({
    consultationId: joi.string().required(),
    dateStart: joi.date().required(),
    dateEnd: joi.date().required(),
  }),
  consultationIdP: joi.object({
    consultationId: joi.string().required(),
  }),
};
