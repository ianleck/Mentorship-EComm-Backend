import express from 'express';
import Utility from '../constants/utility';
import { UploadController } from '../controllers/upload.controller';

const passport = require('passport');

const router = express.Router();

// ================================ TRANSCRIPTS ================================
router.post(
  '/transcript',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadTranscript)
);
// ================================ CV ================================
router.post(
  '/cv',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadCv)
);
// ================================ PROFILE IMG ================================

router.post(
  '/dp',
  passport.authenticate('isAuthenticated', { session: false }),
  Utility.asyncHandler(UploadController.uploadProfilePic)
);

export default router;
