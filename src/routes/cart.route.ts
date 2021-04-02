import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { CartController } from '../controllers/cart.controller';
import { requireStudent } from '../middlewares/authenticationMiddleware';
import cart from './schema/cart.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  Utility.asyncHandler(CartController.viewCart)
);

router.post(
  '/course/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.addCourseB),
  Utility.asyncHandler(CartController.addCourse)
);

router.post(
  '/mentorshipListing/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.addMentorshipListingB),
  Utility.asyncHandler(CartController.addMentorshipListing)
);

router.put(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(cart.updateMentorshipCartQ),
  Utility.asyncHandler(CartController.updateMentorshipCartQuantity)
);

router.delete(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.courseAndContractIdsB),
  Utility.asyncHandler(CartController.deleteItems)
);

export default router;
