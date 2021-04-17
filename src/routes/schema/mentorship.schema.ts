import joi from 'joi';
import { CONTRACT_PROGRESS_ENUM, VISIBILITY_ENUM } from '../../constants/enum';
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

  terminateMentorshipQ: joi.object({
    mentorshipContractId: joi.string().required(),
    action: joi
      .string()
      .valid(...Object.values(CONTRACT_PROGRESS_ENUM))
      .required(),
  }),

  mentorshipContractB: joi.object({
    applicationFields: joi.object({
      applicationReason: joi.string().required(),
      stepsTaken: joi.string().optional(),
      idealDuration: joi.string().optional(),
      goals: joi.string().required(),
      additionalInfo: joi.string().optional(),
    }),
  }),

  acceptMentorshipB: joi.object({
    emailParams: joi.object({
      numSlots: joi.string().required(),
      duration: joi.string().required(),
      message: joi.string().optional(),
    }),
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
    mentorshipContractId: joi.string().optional(),
    accountId: joi.string().optional(),
  }),

  createTestimonialParams: joi.object({
    mentorshipContractId: joi.string().required(),
    accountId: joi.string().required(),
  }),

  taskBucketP: joi.object({
    taskBucketId: joi.string().required(),
  }),

  addTaskBucketB: joi.object({
    newTaskBucket: joi
      .object({
        title: joi.string().required(),
      })
      .required(),
  }),

  editTaskBucketB: joi.object({
    editedTaskBucket: joi
      .object({
        title: joi.string().required(),
        taskOrder: joi.array().items(joi.string()).required(),
      })
      .required(),
  }),

  taskP: joi.object({
    taskId: joi.string().required(),
  }),

  addTaskB: joi.object({
    newTask: joi
      .object({
        body: joi.string().required().allow(''),
        dueAt: joi.date().optional(),
      })
      .required(),
  }),

  editTaskB: joi.object({
    editedTask: joi
      .object({
        body: joi.string().required().allow(''),
        dueAt: joi.date().optional().allow(null),
        progress: joi
          .string()
          .valid(...Object.values(CONTRACT_PROGRESS_ENUM))
          .optional(),
      })
      .required(),
  }),
  noteIdP: joi.object({
    noteId: joi.string().required(),
  }),
  createNoteB: joi.object({
    newNote: joi
      .object({
        title: joi.string().required(),
        body: joi.string().required(),
      })
      .required(),
  }),
  updateNoteB: joi.object({
    updateNote: joi
      .object({
        title: joi.string().optional(),
        body: joi.string().optional(),
      })
      .required(),
  }),
};
