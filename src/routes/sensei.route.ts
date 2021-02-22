import express from 'express';

import { SenseiController } from '../controllers/sensei.controller';
import sensei from './schema/sensei.schema';
import user from './schema/user.schema';

import Utility from '../constants/utility';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

//get list of active senseis
router.get('/', Utility.asyncHandler(SenseiController.getAllActiveSenseis));

router.get(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(SenseiController.getSensei)
);

router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(sensei.updateSenseiB),
  Utility.asyncHandler(SenseiController.updateSensei)
);

router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(SenseiController.deactivateSensei)
);

export default router;

// In case we want to have one getProfile endpoint for all the things
// router.get(
//   '/profile/:accountId',
//   passport.authenticate('isAuthenticated', { session: false }),
//   schemaValidator.params(user.getUser),
//   Utility.asyncHandler(SenseiController.getProfile)
// );
