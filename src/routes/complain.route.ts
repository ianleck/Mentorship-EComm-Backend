import express from 'express';
import Utility from '../constants/utility';
import { CourseController } from '../controllers/course.controller';
import {
  optionalAuth,
  requireSameUserOrAdmin,
  requireSensei,
  requireAdmin,
  requireStudent,
} from '../middlewares/authenticationMiddleware';
import complain from './schema/complain.schema';
import user from './schema/user.schema';

const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== COMMENT COMPLAINS ========================================
// get all courses

// router.post(
//   '/comment/:commentId',
//   passport.authenticate('isAuthenticated', { session: false }),
//   schemaValidator.params(complain.courseIdP),
//   Utility.asyncHandler(CourseController.getOneCourse)
// );
export default router;
