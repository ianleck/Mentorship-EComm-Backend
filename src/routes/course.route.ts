import express from 'express';
import Utility from '../constants/utility';
import { CourseController } from '../controllers/course.controller';
import course from './schema/course.schema';
const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(course.createCourseB),
  Utility.asyncHandler(CourseController.createCourse)
);

router.post(
  '/contract/:courseId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.createContractP),
  Utility.asyncHandler(CourseController.createContract)
);

export default router;
