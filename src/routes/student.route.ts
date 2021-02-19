import express from "express";

import { StudentController } from "../controllers/student.controller";
import student from "./schema/student.schema";
import user from "./schema/user.schema";

import Utility from "../constants/utility";

const router = express.Router();

const schemaValidator = require("express-joi-validation").createValidator({});

// UPDATE STUDENT
// params: accountId: string
router.post(
  "/",
  schemaValidator.query(user.accountIdQ),
  schemaValidator.body(student.updateStudentB),
  Utility.asyncHandler(StudentController.updateStudent)
);

export default router;
