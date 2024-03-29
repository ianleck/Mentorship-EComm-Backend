import express from 'express';
import passport from 'passport';
import Utility from '../constants/utility';
import { SocialController } from '../controllers/social.controller';
import { requireSameUser } from '../middlewares/authenticationMiddleware';
import social from './schema/social.schema';
import user from './schema/user.schema';

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

//================================== POSTS =============================================
router.post(
  '/post/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  schemaValidator.body(social.createPostB),
  Utility.asyncHandler(SocialController.createPost)
);

router.put(
  '/post/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(social.postIdP),
  schemaValidator.body(social.editPostB),
  Utility.asyncHandler(SocialController.editPost)
);

router.delete(
  '/post/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
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

//anyone who is logged in can access this
router.get(
  '/post/following/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getFollowingFeed)
);

//anyone who is logged in can access this
router.get(
  '/post/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getUserFeed)
);

//anyone who is logged in can access this
router.get(
  '/post/one/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(social.postIdP),
  Utility.asyncHandler(SocialController.getPostById)
);

//================================== FOLLOWING =============================================
//Cancel Request to Follow a User
router.delete(
  '/following/request/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of following
  Utility.asyncHandler(SocialController.removeRequest)
);

//Accept Following Request
router.put(
  '/following/accept/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of follower
  Utility.asyncHandler(SocialController.acceptFollowingRequest)
);

//Reject Following Request
router.delete(
  '/following/reject/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of follower
  Utility.asyncHandler(SocialController.rejectFollowingRequest)
);

//Follow User
router.post(
  '/following/follow/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of following
  Utility.asyncHandler(SocialController.followUser)
);

//Unfollow User
router.delete(
  '/following/unfollow/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of following
  Utility.asyncHandler(SocialController.unfollowUser)
);

//Remove user from Following list (Done by user who is being followed)
router.delete(
  '/following/remove/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP), //accountId of follower
  Utility.asyncHandler(SocialController.removeUserFromFollowingList)
);

//View Following List
router.get(
  '/following/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getFollowingList)
);

//View Follower List
router.get(
  '/follower/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getFollowerList)
);

//View Pending List (the list of users :accountId has requested to follow)
router.get(
  '/pending-following/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getPendingFollowingList)
);

// Block User
router.post(
  '/block/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.blockUser)
);

// Unblock User
router.delete(
  '/unblock/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.unblockUser)
);

//View Follower Requests (Pending Followers of the :accountId)
router.get(
  '/pending-followers/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getPendingFollowerList)
);

router.get(
  '/blocked/all/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser,
  schemaValidator.params(user.accountIdP),
  Utility.asyncHandler(SocialController.getUsersBlocked)
);

export default router;
