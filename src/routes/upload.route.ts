import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';
import course from './schema/course.schema';
const passport = require('passport');
const router = express.Router();
const schemaValidator = require('express-joi-validation').createValidator({});
// ================================ TRANSCRIPTS ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);
// ================================ CV ================================
router.post(
  '/cv',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadCv)
);
// ================================ PROFILE IMG ================================

router.post(
  '/dp',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadProfilePic)
);

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
export default router;
