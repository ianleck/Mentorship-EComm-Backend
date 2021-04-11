import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { ConsultationController } from '../controllers/consultation.controller';
import { requireSensei } from '../middlewares/authenticationMiddleware';
import consultation from './schema/consultation.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== Consultation ========================================
//add consultation slot
router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.body(consultation.createConsultationB),
  Utility.asyncHandler(ConsultationController.createConsultationSlot)
);

//edit consultation slot
router.put(
  '/:consultationId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(consultation.consultationIdP),
  schemaValidator.body(consultation.editConsultationB),
  Utility.asyncHandler(ConsultationController.editConsultationSlot)
);

//remove consultation slot
router.delete(
  '/:consultationId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(consultation.consultationIdP),
  Utility.asyncHandler(ConsultationController.deleteComment)
);

export default router;
