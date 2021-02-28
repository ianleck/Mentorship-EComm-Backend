import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import {
  requireSensei,
  requireStudent,
  requireAdmin,
} from '../middlewares/userTypeHandler';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ==================== MENTORSHIP LISTINGS ====================
//get ALL mentorship listings
router.get(
  '/mentorship-listings',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(MentorshipController.getMentorshipListings)
);

//get single sensei mentorship listings
router.get(
  '/mentorship-listings/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.userIdQ),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipListings)
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
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.updateListing)
);

router.delete(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(MentorshipController.deleteListing)
);

// ==================== MENTORSHIP CONTRACT ====================
router.post(
  '/application/:mentorshipListingId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipApplicationQ),
  schemaValidator.body(mentorship.mentorshipListingB), // Should be created with subscription here
  Utility.asyncHandler(MentorshipController.createApplication)
);

//get ALL mentorship applications
router.get(
  '/mentorship-applications',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(MentorshipController.getAllMentorshipApplications)
);

//get ONE mentorship application of ONE student
router.get(
  '/applications/:mentorshipContractId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractQ),
  Utility.asyncHandler(MentorshipController.getStudentMentorshipApplication)
);

//get ALL mentorship applications of ONE student
router.get(
  '/applications/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.userIdQ),
  Utility.asyncHandler(MentorshipController.getAllStudentMentorshipApplications)
);

//get ALL mentorship applications of ONE sensei
router.get(
  '/applications/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.userIdQ),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipApplications)
);

//get ALL mentorship applications of ONE sensei for a particular listing
router.get(
  '/applications/:mentorshipListing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(
    MentorshipController.getSenseiListingMentorshipApplications
  )
);

router.put(
  '/application/:mentorshipListing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipListingQ),
  schemaValidator.body(mentorship.mentorshipApplicationB), // Should be created with subscription as well
  Utility.asyncHandler(MentorshipController.createApplication)
);

router.delete(
  '/application/:mentorshipListing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(MentorshipController.deleteListing)
);
export default router;
