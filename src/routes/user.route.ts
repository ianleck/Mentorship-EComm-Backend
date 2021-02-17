import express from 'express';

import { UserController } from '../controllers/user.controller';
import user from './schema/user.schema';
import Utility from '../constants/utility';

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

router.get(
  '/getUser/:accountId',
  schemaValidator.query(user.getUser),
  Utility.asyncHandler(UserController.getUser)
);

export default router;
