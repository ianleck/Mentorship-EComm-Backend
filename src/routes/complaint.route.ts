import express from 'express';
import Utility from '../constants/utility';
import { ComplaintController } from '../controllers/complaint.controller';
import { requireAdmin } from '../middlewares/authenticationMiddleware';
import comment from './schema/comment.schema';
import complaint from './schema/complaint.schema';

const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== COMPLAINT REASON ========================================
router.post(
  '/reason',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.body(complaint.complaintReasonB),
  Utility.asyncHandler(ComplaintController.createComplaintReason)
);

router.get(
  '/reason',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  Utility.asyncHandler(ComplaintController.getComplaintReasons)
);

// ======================================== COMMENT COMPLAINTS ========================================
// Get complaints
router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.body(complaint.getFilter),
  Utility.asyncHandler(ComplaintController.getComplaintsByFilter)
);

// Add a comment complain
router.post(
  '/comment/:commentId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(comment.commentIdP),
  schemaValidator.body(complaint.complaintB),
  Utility.asyncHandler(ComplaintController.createCommentComplaint)
);

// Resolve complaint
router.put(
  '/:complaintId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireAdmin,
  schemaValidator.params(complaint.complaintP),
  Utility.asyncHandler(ComplaintController.resolveComplaint)
);

export default router;
