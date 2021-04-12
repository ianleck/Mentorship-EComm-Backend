import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { ConsultationController } from '../controllers/consultation.controller';
import {
  requireSensei,
  requireStudent,
} from '../middlewares/authenticationMiddleware';
import consultation from './schema/consultation.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== Consultation ========================================
//add consultation slot
router.post(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.query(consultation.viewRangeQ),
  schemaValidator.body(consultation.createConsultationB),
  Utility.asyncHandler(ConsultationController.createConsultationSlot)
);

//edit consultation slot
router.put(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.query(consultation.consultationIdQ),
  schemaValidator.body(consultation.editConsultationB),
  Utility.asyncHandler(ConsultationController.editConsultationSlot)
);

//remove consultation slot
router.delete(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.query(consultation.consultationIdQ),
  Utility.asyncHandler(ConsultationController.deleteConsultationSlot)
);

router.get(
  '/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(consultation.viewRangeQ),
  Utility.asyncHandler(ConsultationController.viewFilteredConsultationSlots)
);

router.put(
  '/register/',
  passport.authenticate('isAuthenticated', { session: false }),
  requireStudent,
  schemaValidator.query(consultation.consultationIdQ),
  Utility.asyncHandler(ConsultationController.registerConsultation)
);

export default router;
