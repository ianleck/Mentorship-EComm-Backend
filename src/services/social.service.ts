import httpStatusCodes from 'http-status-codes';
import { ERRORS, SOCIAL_ERRORS } from '../constants/errors';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { LikePost } from '../models/LikePost';

export default class SocialService {
  // ======================================== POSTS ========================================
  public static async createPost(
    accountId: string,
    post: {
      content: string, 
    }
  ): Promise<Post> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    
    const { content } = post;

    const newPost = new Post({
      accountId,
      content
    });

    await newPost.save();
    
    return newPost;
  }

  public static async editPost(
    accountId: string, 
    postId: string,
    editedPost
  ): Promise<Post> {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);
    
    //Check if user sending the request is the user who created the post
    if (post.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return await post.update(editedPost);
  }

  public static async deletePost(
    postId: string,
    accountId: string
  ): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);

    // Check if user sending the request is the user who created the post
    if (post.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    await Post.destroy({
      where: {
        postId,
      },
    });
  }

  public static async likePost(
      postId: string,
      accountId: string
  ): Promise<LikePost> {
      const post = await Post.findByPk(postId);
      if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);

      const user = await User.findByPk(accountId);
      if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

      const likedPost = new LikePost({
        accountId,
        postId 
      });

      await likedPost.save();

      return likedPost; 
  }

  public static async unlikePost(
    postId: string,
    accountId: string
): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);

    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    await LikePost.destroy({
        where: {
          postId,
        },
      });
    }
}