import express from 'express';
import auth from './schema/auth.schema';
import Utility from '../constants/utility';
import { AuthController } from '../controllers/auth.controller';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER AUTH ================================
router.post(
  '/login',
  schemaValidator.body(auth.login),
  Utility.asyncHandler(AuthController.login)
);

router.post(
  '/register',
  schemaValidator.body(auth.register),
  Utility.asyncHandler(AuthController.register)
);

// ================================ PASSWORD AUTH ================================

// authentication: check that req.user == accountId
router.put(
  '/change-password',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(auth.changePassword),
  Utility.asyncHandler(AuthController.changePassword)
);

export default router;
