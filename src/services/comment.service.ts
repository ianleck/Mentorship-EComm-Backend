import httpStatusCodes from 'http-status-codes';
import { USER_TYPE_ENUM } from '../constants/enum';
import {
  COMMENT_ERRORS,
  COURSE_ERRORS,
  SOCIAL_ERRORS,
} from '../constants/errors';
import { Comment } from '../models/Comment';
import { Lesson } from '../models/Lesson';
import { Post } from '../models/Post';
import { User } from '../models/User';

export default class CommentService {
  // ======================================== COMMENTS ========================================
  public static async editComment(
    commentId: string,
    accountId: string,
    editedComment
  ): Promise<Comment> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new Error(COMMENT_ERRORS.COMMENT_MISSING);

    // Check if user sending the request is the user who created the comment
    if (comment.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await comment.update(editedComment);
  }

  public static async deleteComment(commentId: string, user): Promise<void> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) throw new Error(COMMENT_ERRORS.COMMENT_MISSING);

    // Check if user sending the request is the user who created the comment OR if the user is an admin
    if (
      comment.accountId !== user.accountId &&
      user.userType !== USER_TYPE_ENUM.ADMIN
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    await Comment.destroy({
      where: {
        commentId,
      },
    });
  }
  // ======================================== COMMENTS FOR LESSON ========================================

  public static async createLessonComment(
    accountId: string,
    lessonId: string,
    bodyText: string,
    postId?: string
  ): Promise<Comment> {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);
    const comment = new Comment({
      accountId,
      lessonId,
      body: bodyText,
      postId,
    });

    await comment.save();
    return comment;
  }

  public static async getLessonComments(lessonId: string): Promise<Comment[]> {
    return Comment.findAll({
      where: {
        lessonId,
      },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'profileImgUrl'],
        },
      ],
    });
  }

  // ======================================== COMMENTS FOR POST ========================================
  public static async createPostComment(
    accountId: string,
    postId: string,
    bodyText: string
  ): Promise<Comment> {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);
    const comment = new Comment({
      accountId,
      postId,
      body: bodyText,
    });

    await comment.save();
    return comment;
  }
}
