import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';
const path = require('path');
import { checkPermission } from '../middlewares/uploadMiddleware';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});
// ================================ TRANSCRIPTS ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);

router.get(
  '/transcript/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  checkPermission, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ CV ================================
router.post(
  '/cv',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadCv)
);

router.get(
  '/cv/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  checkPermission, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ PROFILE IMG ================================

router.post(
  '/dp',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadProfilePic)
);

router.get('/dp/*', express.static(path.join(__dirname, '../../uploads')));

export default router;
