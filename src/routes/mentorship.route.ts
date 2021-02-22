import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/createListing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(mentorship.newMentorshipListingB),
  Utility.asyncHandler(MentorshipController.createListing)
);

export default router;
