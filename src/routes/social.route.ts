import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { requireSameUser } from '../middlewares/authenticationMiddleware';
import { SocialController } from '../controllers/social.controller';
import social from './schema/social.schema';
import user from './schema/user.schema';


const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

router.post(
  '/post/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser, 
  schemaValidator.params(user.accountIdP), 
  schemaValidator.body(social.createPostB),
  Utility.asyncHandler(SocialController.createPost)
);

export default router;
