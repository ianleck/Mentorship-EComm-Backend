import joi from 'joi';
import { VISIBILITY_ENUM } from '../../constants/enum';
export default {
  mentorshipListingB: joi.object({
    mentorshipListing: joi
      .object({
        name: joi.string().required(),
        categories: joi.array().items(joi.string().required()).required(),
        description: joi.string().required(),
        priceAmount: joi.number().required(),
        visibility: joi
          .string()
          .valid(...Object.values(VISIBILITY_ENUM))
          .optional(),
      })
      .required(),
  }),

  mentorshipListingP: joi.object({
    mentorshipListingId: joi.string().required(),
  }),

  mentorshipContractP: joi.object({
    mentorshipContractId: joi.string().required(),
  }),

  mentorshipContractB: joi.object({
    statement: joi.string().required(),
  }),

  addTestimonialB: joi.object({
    newTestimonial: joi
      .object({
        body: joi.string().required(),
      })
      .required(),
  }),

  editTestimonialB: joi.object({
    editedTestimonial: joi
      .object({
        body: joi.string().required(),
      })
      .required(),
  }),

  testimonialP: joi.object({
    testimonialId: joi.string().required(),
  }),

  getFilter: joi.object({
    mentorshipListingId: joi.string().optional(),
    accountId: joi.string().optional(),
  }),

  createTestimonialParams: joi.object({
    mentorshipListingId: joi.string().required(),
    accountId: joi.string().required(),
  }),

  addTaskBucketB: joi.object({
    newTaskBucket: joi
      .object({
        title: joi.string().required(),
      })
      .required(),
  }),

  taskBucketP: joi.object({
    taskBucketId: joi.string().required(),
  }),

  editTaskBucketB: joi.object({
    editedTaskBucket: joi
      .object({
        title: joi.string().required(),
      })
      .required(),
  }),
};
