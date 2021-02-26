import express from 'express';
import { UserController } from '../controllers/user.controller';
import user from './schema/user.schema';
import Utility from '../constants/utility';
import { requireAdmin } from '../middlewares/userTypeHandler';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER AUTH ================================
router.post(
  '/login',
  schemaValidator.body(user.login),
  Utility.asyncHandler(UserController.login)
);

router.post(
  '/register',
  schemaValidator.body(user.register),
  Utility.asyncHandler(UserController.register)
);

// authentication: check that req.user == accountId
router.put(
  '/change-password',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(user.changePassword),
  Utility.asyncHandler(UserController.changePassword)
);

// ================================ USER ================================

// get user (student/sensei)
router.get(
  '/:accountId',
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(UserController.getUser)
);

// get all senseis
router.get('/sensei', Utility.asyncHandler(UserController.getAllActiveSenseis));

// get all students (only admin)
router.get(
  '/student',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(UserController.getAllActiveStudents)
);

// update user (student/sensei) (all fields other than occupation and ?industry? check schema for source of truth)
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(user.updateUserB),
  Utility.asyncHandler(UserController.updateUser)
);

// delete user (student/sensei)
router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(UserController.deactivateUser)
);

// ================================ USER EXPERIENCE ================================
router.post(
  '/experience/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(user.createExperienceB),
  Utility.asyncHandler(UserController.createExperience)
);

// update experience
router.put(
  '/experience/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(user.updateExperienceB),
  Utility.asyncHandler(UserController.updateExperience)
);

// delete user experience
router.delete(
  '/experience/:accountId/:experienceId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.deleteExperienceParams),
  Utility.asyncHandler(UserController.deleteExperience)
);

export default router;
