import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';
const path = require('path');

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ================================ USER AUTH ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);

router.get(
  '/transcript/*',
  passport.authenticate('isAuthenticated', { session: false }),
  express.static(path.join(__dirname, '../../uploads'))
);

router.post(
  '/dp',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadProfilePic)
);

router.get('/dp/*', express.static(path.join(__dirname, '../../uploads')));

export default router;
