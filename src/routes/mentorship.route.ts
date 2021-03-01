import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import Utility from '../constants/utility';
import {
  requireSensei,
  requireStudent,
  requireAdmin,
} from '../middlewares/userTypeHandler';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ==================================== MENTORSHIP LISTINGS ====================================
router.post(
  '/listing/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
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

//Accept Mentorship Application
router.put(
  '/accept-application/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractQ),
  Utility.asyncHandler(MentorshipController.acceptMentorshipContract)
);

//Reject Mentorship Application
router.put(
  '/reject-application/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractQ),
  Utility.asyncHandler(MentorshipController.rejectMentorshipContract)
);

router.delete(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(MentorshipController.deleteListing)
);

router.get(
  '/listing/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipListingQ),
  Utility.asyncHandler(MentorshipController.getListing)
);

//get ALL mentorship listings
router.get(
  '/listing',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(MentorshipController.getMentorshipListings)
);

//get single sensei mentorship listings
router.get(
  '/listing/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.accountIdQ),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipListings)
);

// ==================================== MENTORSHIP CONTRACT ====================================
router.post(
  '/contract/:mentorshipListingId/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipListingQ),
  schemaValidator.body(mentorship.mentorshipContractB), // Should be created with subscription here
  Utility.asyncHandler(MentorshipController.createContract)
);

router.put(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipContractQ),
  schemaValidator.body(mentorship.mentorshipContractB), // Should be created with subscription as well
  Utility.asyncHandler(MentorshipController.updateContract)
);

router.delete(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipContractQ),
  Utility.asyncHandler(MentorshipController.deleteContract)
);

//get ALL mentorship contracts
router.get(
  '/contract',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(MentorshipController.getAllMentorshipContracts)
);

//get ONE mentorship contract
router.get(
  '/contract/:mentorshipContractId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.mentorshipContractQ),
  Utility.asyncHandler(MentorshipController.getStudentMentorshipContract)
);

//get ALL mentorship contracts of ONE student
router.get(
  '/contract/student/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.accountIdQ),
  Utility.asyncHandler(MentorshipController.getAllStudentMentorshipContracts)
);

//get ALL mentorship contracts of ONE sensei
router.get(
  '/contract/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(mentorship.accountIdQ),
  Utility.asyncHandler(MentorshipController.getSenseiMentorshipContracts)
);

//get ALL mentorship contracts of ONE sensei for a particular listing
// router.get(
//   '/contracts/:mentorshipListingId',
//   passport.authenticate('isAuthenticated', { session: false }),
//   schemaValidator.params(mentorship.mentorshipListingQ),
//   Utility.asyncHandler(
//     MentorshipController.getSenseiListingMentorshipContracts
//   )
// );
export default router;
