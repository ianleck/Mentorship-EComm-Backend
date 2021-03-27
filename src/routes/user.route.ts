import express from 'express';
import Utility from '../constants/utility';
import { UserController } from '../controllers/user.controller';
import {
  requireAdmin,
  requireSameUser,
  requireSameUserOrAdmin,
} from '../middlewares/authenticationMiddleware';
import user from './schema/user.schema';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER ================================

// get user (student/sensei)
router.get(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(UserController.getUser)
);

// get all senseis
router.get(
  '/all/sensei',
  Utility.asyncHandler(UserController.getAllActiveSenseis)
);

// get all students (only admin)
router.get(
  '/all/student',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(UserController.getAllActiveStudents)
);

// update user (student/sensei) (all fields other than occupation and ?industry? check schema for source of truth)
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser, // if request.user is sending a request to update an account that is not his/hers, return unauthorized
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(user.updateUserB),
  Utility.asyncHandler(UserController.updateUser)
);

// delete user (student/sensei)
router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUserOrAdmin,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(UserController.deactivateUser)
);

// ================================ USER EXPERIENCE ================================
router.post(
  '/experience/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser, // if request.user is sending a request to update an account that is not his/hers, return unauthorized
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(user.createExperienceB),
  Utility.asyncHandler(UserController.createExperience)
);

// update experience
router.put(
  '/experience/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser, // if request.user is sending a request to update an account that is not his/hers, return unauthorized
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(user.updateExperienceB),
  Utility.asyncHandler(UserController.updateExperience)
);

// delete user experience
router.delete(
  '/experience/:accountId/:experienceId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser, // if request.user is sending a request to update an account that is not his/hers, return unauthorized
  schemaValidator.params(user.deleteExperienceParams),
  Utility.asyncHandler(UserController.deleteExperience)
);

export default router;
