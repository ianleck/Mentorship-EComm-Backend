import express from 'express';
import { UserController } from '../controllers/user.controller';
import user from './schema/user.schema';
import Utility from '../constants/utility';
const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

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

router.delete(
  '/:accountId/:userType',
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(UserController.deactivateUser)
);

export default router;
