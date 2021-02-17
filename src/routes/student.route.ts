import express from 'express';

import { StudentController } from '../controllers/student.controller';
import student from './schema/student.schema';
import user from './schema/user.schema';

import Utility from "../constants/utility";

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({})


// 1) Create student/sensei - is register sufficient
// 2) delete/deactive user - should this bbe an admin function - no, can be done by user/admin too
// 3) deleete/deactive user - can we just toggle the user status instead of activating/deactivating
// UPDATE STUDENT
router.post(
    '/:accountId',
    schemaValidator.query(user.accountIdQ),
    schemaValidator.body(student.updateStudentB),
    Utility.asyncHandler(StudentController.updateStudent),
);

router.delete(
    '/:accountId',
    schemaValidator.query(user.accountIdQ),
    Utility.asyncHandler(StudentController.deactivateStudent)
)

export default router;
