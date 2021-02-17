import express from "express";

import { StudentController } from "../controllers/student.controller";
import student from "./schema/student.schema";
import Utility from "../constants/utility";

const router = express.Router();

const schemaValidator = require("express-joi-validation").createValidator({});

router.post(
  "/update-student",
  schemaValidator.body(student.updateStudent),
  Utility.asyncHandler(StudentController.updateStudent)
);

export default router;
