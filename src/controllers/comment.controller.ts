import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  COMMENT_ERRORS,
  COURSE_ERRORS,
  RESPONSE_ERROR,
  SOCIAL_ERRORS,
} from '../constants/errors';
import { COMMENT_RESPONSE } from '../constants/successMessages';
import CommentService from '../services/comment.service';
import apiResponse from '../utilities/apiResponse';

export class CommentController {
  // ======================================== COMMENTS ========================================
  public static async editComment(req, res) {
    const { user } = req;
    const { commentId } = req.params;
    const { editedComment } = req.body;
    try {
      const updatedComment = await CommentService.editComment(
        commentId,
        user.accountId,
        editedComment
      );
      return apiResponse.result(
        res,
        {
          message: COMMENT_RESPONSE.COMMENT_POST_EDIT,
          comment: updatedComment,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[commentController.editComment]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COMMENT_ERRORS.COMMENT_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteComment(req, res) {
    const { user } = req;
    const { commentId } = req.params;
    try {
      await CommentService.deleteComment(commentId, user);
      return apiResponse.result(
        res,
        {
          message: COMMENT_RESPONSE.COMMENT_DELETE,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[commentController.deleteComment]:' + e.message);
      if (
        e.message === COMMENT_ERRORS.COMMENT_MISSING ||
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== COMMENTS FOR LESSON ========================================
  public static async createLessonComment(req, res) {
    const { user } = req;
    const { comment } = req.body;
    const { lessonId } = req.params;
    try {
      const createdComment = await CommentService.createLessonComment(
        user.accountId,
        lessonId,
        comment.body
      );
      return apiResponse.result(
        res,
        {
          message: COMMENT_RESPONSE.COMMENT_LESSON_CREATE,
          comment: createdComment,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[commentController.createLessonComment]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.CONTRACT_EXISTS ||
        e.message === COURSE_ERRORS.LESSON_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getLessonComments(req, res) {
    const { lessonId } = req.params;
    try {
      const comments = await CommentService.getLessonComments(lessonId);
      return apiResponse.result(
        res,
        { message: 'success', comments },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[commentController.getLessonComments]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== COMMENTS FOR POST ========================================
  public static async createPostComment(req, res) {
    const { user } = req;
    const { comment } = req.body;
    const { postId } = req.params;
    try {
      const createdComment = await CommentService.createPostComment(
        user.accountId,
        postId,
        comment.body
      );
      return apiResponse.result(
        res,
        {
          message: COMMENT_RESPONSE.COMMENT_POST_CREATE,
          comment: createdComment,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[commentController.createPostComment]:' + e.message);
      if (e.message === SOCIAL_ERRORS.POST_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
