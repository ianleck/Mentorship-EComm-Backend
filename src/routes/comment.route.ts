import express from 'express';
import Utility from '../constants/utility';
import { CommentController } from '../controllers/comment.controller';
import comment from './schema/comment.schema';
import course from './schema/course.schema';
import social from './schema/social.schema';

const passport = require('passport');
const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

// ======================================== COMMENTS ========================================
//edit comment
router.put(
  '/:commentId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(comment.commentIdP),
  schemaValidator.body(comment.editPostCommentB),
  Utility.asyncHandler(CommentController.editComment)
);

router.delete(
  '/:commentId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(comment.commentIdP),
  Utility.asyncHandler(CommentController.deleteComment)
);

// ======================================== COMMENTS FOR LESSON ========================================
router.post(
  '/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  schemaValidator.body(comment.createLessonCommentB),
  Utility.asyncHandler(CommentController.createLessonComment)
);

router.get(
  '/lesson/:lessonId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(course.lessonIdP),
  Utility.asyncHandler(CommentController.getLessonComments)
);

// ======================================== COMMENTS FOR POST ========================================

//add comment
router.post(
  '/post/:postId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(social.postIdP),
  schemaValidator.body(comment.createPostCommentB),
  Utility.asyncHandler(CommentController.createPostComment)
);

export default router;
