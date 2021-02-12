import express from 'express';

import { UserController } from '../../controllers/user.controller';
import user from '../../constants/schema/user.schema';
import {asyncHandler} from "../../constants/utility";

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({})

router.post(
    '/login',
    schemaValidator.body(user.login),
    asyncHandler(UserController.login),
);

router.post(
    '/register',
    schemaValidator.body(user.register),
    asyncHandler(UserController.register),
);

export default router;
