import express from 'express';
import email from './schema/email.schema';
import Utility from '../constants/utility';
import { EmailController } from '../controllers/email.controller';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/send',
  schemaValidator.query(email.emailQ),
  Utility.asyncHandler(EmailController.sendEmail)
);

export default router;
