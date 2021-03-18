import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { SocialController } from '../controllers/social.controller';
import { requireSensei } from '../middlewares/authenticationMiddleware';
import social from './schema/social.schema';
import user from './schema/user.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

//================================== POSTS =============================================
router.post(
  '/post/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(social.createPostB),
  Utility.asyncHandler(SocialController.createPost)
);

router.put(
  '/post/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(social.postIdP),
  schemaValidator.body(social.editPostB),
  Utility.asyncHandler(SocialController.editPost)
);

router.delete(
  '/post/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSensei,
  schemaValidator.params(social.postIdP),
  Utility.asyncHandler(SocialController.deletePost)
);

router.post(
  '/post/like/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(social.postIdP),
  Utility.asyncHandler(SocialController.likePost)
);

router.delete(
  '/post/unlike/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(social.postIdP),
  Utility.asyncHandler(SocialController.unlikePost)
);

//================================== FOLLOWING =============================================
//Request to Follow a User 
router.post(
  '/following/request/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of following
  Utility.asyncHandler(SocialController.requestFollowing)
); 

//Cancel Request to Follow a User 
router.put(
  '/following/request/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of following
  Utility.asyncHandler(SocialController.removeRequest)
);

//Add user to following list 
router.put(
  '/following/add/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of follower
  Utility.asyncHandler(SocialController.addUserToFollowingList)
);

//Remove user from Following list 
router.put(
'/following/remove/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of follower
  Utility.asyncHandler(SocialController.removeUserFromFollowingList)
);

export default router;
