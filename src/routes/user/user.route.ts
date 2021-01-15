import express from 'express';

import { UserController } from '../../controllers/user.controller';
import user from '../../constants/schema/user.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({})

router.get(
    '/',
    schemaValidator.query(user.helloWorldQuery),
    UserController.self,
);

export default router;
