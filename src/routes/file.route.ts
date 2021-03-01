import express from 'express';
import { checkPermission } from '../middlewares/uploadMiddleware';
const path = require('path');

const passport = require('passport');
const router = express.Router();

// ================================ TRANSCRIPTS ================================
router.get(
  '/transcript/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  checkPermission, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ CV ================================
router.get(
  '/cv/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  checkPermission, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ PROFILE IMG ================================
router.get('/dp/*', express.static(path.join(__dirname, '../../uploads')));

export default router;
