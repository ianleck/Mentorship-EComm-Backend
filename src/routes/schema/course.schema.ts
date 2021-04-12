import joi from 'joi';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  VISIBILITY_ENUM,
} from '../../constants/enum';

export default {
  createAnnouncement: joi.object({
    newAnnouncement: joi
      .object({
        title: joi.string().required(),
        description: joi.string().required(),
      })
      .required(),
  }),
  createCourseB: joi.object({
    newCourse: joi
      .object({
        title: joi.string().required(),
        subTitle: joi.string().required(),
        description: joi.string().required(),
        imgUrl: joi.string().allow('', null),
        language: joi.string().required(),
        priceAmount: joi.number().required(),
        currency: joi.string().required(),
        categories: joi.array().items(joi.string().required()).required(),
        visibility: joi.string().valid(...Object.values(VISIBILITY_ENUM)),
        level: joi
          .string()
          .valid(...Object.values(LEVEL_ENUM))
          .required(),
      })
      .required(),
  }),
  courseIdP: joi.object({
    courseId: joi.string().required(),
  }),
  lessonIdP: joi.object({
    lessonId: joi.string().required(),
  }),
  announcementIdP: joi.object({
    announcementId: joi.string().required(),
  }),
  studentIdP: joi.object({
    accountId: joi.string().required(),
  }),

  getFilter: joi.object({
    adminVerified: joi.string().valid(...Object.values(ADMIN_VERIFIED_ENUM)),
    visibility: joi.string().valid(...Object.values(VISIBILITY_ENUM)),
  }),
  markLessonAsCompletedP: joi.object({
    courseContractId: joi.string().required(),
    lessonId: joi.string().required(),
  }),
  updateCourseB: joi.object({
    updatedCourse: joi
      .object({
        courseId: joi.string().allow('', null), // using courseId from params anyway.
        title: joi.string(),
        subTitle: joi.string(),
        description: joi.string(),
        imgUrl: joi.string().allow('', null),
        language: joi.string(),
        priceAmount: joi.number(),
        currency: joi.string(),
        categories: joi.array().items(joi.string().required()),
        visibility: joi.string().valid(...Object.values(VISIBILITY_ENUM)),
        adminVerified: joi
          .string()
          .valid(...Object.values(ADMIN_VERIFIED_ENUM)),
        level: joi.string().valid(...Object.values(LEVEL_ENUM)),
        publishedAt: joi.string().optional(),
      })
      .required(),
  }),
  updateLessonB: joi.object({
    updateLesson: joi
      .object({
        title: joi.string().optional(),
        description: joi.string().optional(),
      })
      .required(),
  }),
  updateAnnouncementB: joi.object({
    updateAnnouncement: joi
      .object({
        title: joi.string().optional(),
        description: joi.string().optional(),
      })
      .required(),
  }),
};
