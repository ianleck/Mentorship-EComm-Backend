import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { ReviewController } from '../controllers/review.controller';
import course from './schema/course.schema';
import mentorship from './schema/mentorship.schema';
import review from './schema/review.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/course/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(review.reviewB),
  Utility.asyncHandler(ReviewController.createCourseReview)
);

router.post(
  '/mentorship/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipListingP),
  schemaValidator.body(review.reviewB),
  Utility.asyncHandler(ReviewController.createMentorshipListingReview)
);

router.put(
  '/course/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(review.reviewB),
  Utility.asyncHandler(ReviewController.editCourseReview)
);

router.put(
  '/mentorship/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipListingP),
  schemaValidator.body(review.reviewB),
  Utility.asyncHandler(ReviewController.editMentorshipListingReview)
);

export default router;
