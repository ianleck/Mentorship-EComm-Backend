import express from 'express';
import Utility from '../constants/utility';
import { AnalyticsController } from '../controllers/analytics.controller';
import analytics from './schema/analytics.schema';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

//Get Mentorship Listings which generate the most $$ (SENSEI & ADMIN)
router.get(
  '/mentorship',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(analytics.getSalesQ),
  Utility.asyncHandler(AnalyticsController.getMentorshipSales)
);

//Get Courses which generate the most $$ (SENSEI & ADMIN)
router.get(
  '/course',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(analytics.getSalesQ),
  Utility.asyncHandler(AnalyticsController.getCourseSales)
);

//Get applications for each listing (SENSEI)
router.get(
  '/mentorship/applications',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(analytics.getSalesQ),
  Utility.asyncHandler(AnalyticsController.getListingApplications)
);

//Get course categories which generate the most $$
router.get(
  '/categories/course',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(analytics.getSalesQ),
  Utility.asyncHandler(AnalyticsController.getCourseCategorySales)
);

//Get mentorship categories which generate the most $$
router.get(
  '/categories/mentorship',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(analytics.getSalesQ),
  Utility.asyncHandler(AnalyticsController.getMentorshipCategorySales)
);

export default router;
