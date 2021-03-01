import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER AUTH ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);

export default router;
