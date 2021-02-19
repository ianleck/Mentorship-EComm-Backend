import express from 'express';

import { SenseiController } from '../controllers/sensei.controller';
import sensei from './schema/sensei.schema';
import user from './schema/user.schema';
import Utility from '../constants/utility';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/:accountId',
  schemaValidator.params(user.accountIdQ),
  schemaValidator.body(sensei.updateSensei),
  Utility.asyncHandler(SenseiController.updateSensei)
);

export default router;
