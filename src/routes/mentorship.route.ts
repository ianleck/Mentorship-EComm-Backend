import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import { requireSensei } from '../middlewares/userTypeHandler';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/listing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.createListing)
);

router.put(
  '/listing/:mentorshipListing',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.updateListing)
);

export default router;
