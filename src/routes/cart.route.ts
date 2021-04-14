import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { CartController } from '../controllers/cart.controller';
import { requireStudent } from '../middlewares/authenticationMiddleware';
import cart from './schema/cart.schema';
import course from './schema/course.schema';
import mentorship from './schema/mentorship.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== CART ========================================

router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  Utility.asyncHandler(CartController.viewCart)
);

router.post(
  '/course',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.addCourseB),
  Utility.asyncHandler(CartController.addCourse)
);

router.post(
  '/mentorship',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.addMentorshipB),
  Utility.asyncHandler(CartController.addMentorshipListing)
);

router.put(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.query(cart.updateMentorshipCartQ),
  Utility.asyncHandler(CartController.updateMentorshipCartQuantity)
);

router.delete(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.body(cart.courseAndListingIdsB),
  Utility.asyncHandler(CartController.deleteItems)
);

// ======================================== UPSELL ========================================
router.get(
  '/checkout',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  Utility.asyncHandler(CartController.upsellCheckout)
);

router.get(
  '/course/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(course.courseIdP),
  Utility.asyncHandler(CartController.upsellOnCourses)
);

router.get(
  '/mentorship/:mentorshipListingId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.params(mentorship.mentorshipListingP),
  Utility.asyncHandler(CartController.upsellOnMentorships)
);

export default router;
