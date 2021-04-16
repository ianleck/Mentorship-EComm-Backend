import express from 'express';
import Utility from '../constants/utility';
import { EmailController } from '../controllers/email.controller';
import email from './schema/email.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/',
  schemaValidator.query(email.emailQ),
  schemaValidator.body(email.emailB),
  Utility.asyncHandler(EmailController.sendEmail)
);

export default router;
