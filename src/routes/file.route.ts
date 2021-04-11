import express from 'express';
import passport from 'passport';
import { FileController } from '../controllers/file.controller';
import { downloadAuthentication } from '../middlewares/authenticationMiddleware';
const path = require('path');

const router = express.Router();
const fs = require('fs');

// ================================ TRANSCRIPTS ================================
router.get(
  '/transcript/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  downloadAuthentication, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ CV ================================
router.get(
  '/cv/:documentName',
  passport.authenticate('isAuthenticated', { session: false }),
  downloadAuthentication, // check that user is retrieving his own document or if user is an admin
  express.static(path.join(__dirname, '../../uploads'))
);

// ================================ PROFILE IMG ================================
router.get('/dp/*', express.static(path.join(__dirname, '../../uploads')));

router.get('/course/*', express.static(path.join(__dirname, '../../uploads')));

/**
 * For serving lesson video, assessment video
 */
router.get('/course/lesson/*', FileController.serveVideo);

// ================================ TASK ATTACHMENT ================================
router.get(
  '/mentorship/task/:documentName',
  express.static(path.join(__dirname, '../../uploads'))
);

export default router;
