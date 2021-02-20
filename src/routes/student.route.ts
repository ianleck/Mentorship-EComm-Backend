import express from 'express';

import { StudentController } from '../controllers/student.controller';
import student from './schema/student.schema';
import user from './schema/user.schema';

import Utility from '../constants/utility';

const router = express.Router();
const passport = require('passport');
const schemaValidator = require('express-joi-validation').createValidator({});

router.get(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(StudentController.getStudent)
);

// UPDATE STUDENT
// params: accountId: string
router.put(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.query(user.accountIdQ),
  schemaValidator.body(student.updateStudentB),
  Utility.asyncHandler(StudentController.updateStudent)
);

router.delete(
  '/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdQ),
  Utility.asyncHandler(StudentController.deactivateStudent)
);

export default router;
