import express from 'express';
import { requireSameUserOrAdmin } from '../middlewares/authenticationMiddleware';
import Utility from '../constants/utility';
import { CourseController } from '../controllers/course.controller';
import course from './schema/course.schema';
import user from './schema/user.schema';

const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ==================== Mentorship Listings ====================
// get all courses
router.get('/', Utility.asyncHandler(CourseController.getAllCourses));

router.get(
  '/sensei/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  schemaValidator.query(course.getFilter),
  Utility.asyncHandler(CourseController.getAllSenseiCourses)
);
// create course draft
router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(course.createCourseB),
  Utility.asyncHandler(CourseController.createCourseDraft)
);

// update course / course draft
router.put(
  '/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.courseIdP),
  schemaValidator.body(course.updateCourseB),
  Utility.asyncHandler(CourseController.updateCourse)
);

// ==================== MENTORSHIP CONTRACTS ====================
router.post(
  '/contract/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.createContractP),
  Utility.asyncHandler(CourseController.createContract)
);

export default router;
