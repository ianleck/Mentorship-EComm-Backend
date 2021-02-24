import express from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import mentorship from './schema/mentorship.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import { requireSensei } from '../middlewares/userTypeHandler';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

/*** GET REQUESTS ***/

//get list of all mentorship listings
router.get(
  '/mentorship-listings',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(MentorshipController.getMentorshipListings)
);

/*** END OF GET REQUESTS ***/

/*** POST REQUESTS ***/

router.post(
  '/listing/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.createListing)
);

/*** END OF POST REQUESTS ***/

/*** PUT REQUESTS ***/

router.put(
  '/listing/:mentorshipListing',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(mentorship.mentorshipListingQ),
  schemaValidator.body(mentorship.mentorshipListingB),
  Utility.asyncHandler(MentorshipController.updateListing)
);

/*** END OF PUT REQUESTS ***/

export default router;
