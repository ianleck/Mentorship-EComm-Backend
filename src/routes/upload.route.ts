import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';
import course from './schema/course.schema';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
const passport = require('passport');
const router = express.Router();
const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER RELATED UPLOADS ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);

router.post(
  '/cv',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadCv)
);

router.post(
  '/dp',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadProfilePic)
);

router.delete(
  '/user/:type',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.deleteTypeP),
  Utility.asyncHandler(UploadController.deleteUserProfileFile)
);

// ================================ COURSE RELATED UPLOADS ================================
router.post(
  '/course/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(UploadController.uploadCoursePic)
);

router.post(
  '/lesson/video/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.uploadLessonVideo)
);
router.post(
  '/lesson/assessment/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.uploadAssessmentVideo)
);

router.post(
  '/lesson/file/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.uploadLessonFile)
);

router.delete(
  '/lesson/video/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.deleteLessonVideo)
);

router.delete(
  '/lesson/assessment/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.deleteAssessmentVideo)
);

router.delete(
  '/lesson/file/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(UploadController.deleteLessonFile)
);

// ================================ MENTORSHIP RELATED UPLOADS ================================

//Add Attachment to Task
router.post(
  '/task/attachment/:taskId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskP),
  Utility.asyncHandler(UploadController.uploadTaskAttachment)
);

// Remove Attachment from Task
router.delete(
  '/task/attachment/:taskId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.taskP),
  Utility.asyncHandler(UploadController.deleteTaskAttachment)
);

export default router;
