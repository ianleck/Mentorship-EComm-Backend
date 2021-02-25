import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import { requireSensei, requireStudent } from '../middlewares/userTypeHandler';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ==================== MENTORSHIP LISTINGS ====================
router.get(
  '/mentorship-listings',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(MentorshipController.getMentorshipListings)
);

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

router.delete(
  '/listing/:mentorshipListing',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(MentorshipController.deleteListing)
);

// ==================== MENTORSHIP CONTRACT ====================
router.post(
  '/application/:mentorshipListing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipApplicationQ),
  // schemaValidator.body(mentorship.mentorshipListingB), // Should be created with subscription here
  Utility.asyncHandler(MentorshipController.createApplication)
);

router.put(
  '/application/:mentorshipListing',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipApplicationQ),
  schemaValidator.body(mentorship.mentorshipApplicationB), // Should be created with subscription as well
  Utility.asyncHandler(MentorshipController.createApplication)
);
export default router;
