import express from 'express';
import Utility from '../constants/utility';
import { ReviewController } from '../controllers/review.controller';
import review from './schema/review.schema';
import course from './schema/course.schema';
import mentorship from './schema/mentorship.schema';

const router = express.Router();
const passport = require('passport');

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

export default router;
