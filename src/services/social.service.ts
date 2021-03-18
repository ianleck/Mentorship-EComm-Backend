import httpStatusCodes from 'http-status-codes';
import { ERRORS, SOCIAL_ERRORS } from '../constants/errors';
import { FOLLOWING_ENUM } from '../constants/enum';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { LikePost } from '../models/LikePost';
import { UserFollowership } from '../models/UserFollowership';
import EmailService from './email.service';


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


// ======================================== FOLLOWING ========================================

public static async requestFollowing(
  followingId: string,
  followerId: string
) {
  const followingUser = await User.findByPk(followingId);
  if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

  const followerUser = await User.findByPk(followerId);
  if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

  const followership = new UserFollowership({
    followingId,
    followerId,  
  });

  await followership.save();

  return followership; 
}

public static async removeRequest(
  followingId: string,
  followerId: string
) {
  const followingUser = await User.findByPk(followingId);
  if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

  const followerUser = await User.findByPk(followerId);
  if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

  const followership = await UserFollowership.findOne({
    where : { followerId, followingId, followingStatus: FOLLOWING_ENUM.PENDING },
  }); 

  if (!followership) throw new Error (SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING); 

  await UserFollowership.destroy({
    where: {
      followerId,
      followingId, 
    },
  });
}


public static async addUserToFollowingList(
  followerId: string,
  followingId: string
  ) {
      const followerUser = await User.findByPk(followerId);
      if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

      const followingUser = await User.findByPk(followingId);
      if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

      const followership = await UserFollowership.findOne({
        where : { followerId, followingId, followingStatus: FOLLOWING_ENUM.PENDING },
      }); 

      if (!followership) throw new Error (SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING); 

      await followership.update({
        followingStatus: FOLLOWING_ENUM.APPROVED, 
      }); 

    }

    public static async removeUserFromFollowingList(
      followerId: string,
      followingId: string
      ) {
        const followerUser = await User.findByPk(followerId);
        if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
  
        const followingUser = await User.findByPk(followingId);
        if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

          const followership = await UserFollowership.findOne({
            where : { followerId, followingId, followingStatus: FOLLOWING_ENUM.APPROVED },
          }); 
    
          if (!followership) throw new Error (SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING); 
    
          await UserFollowership.destroy({
            where: {
              followerId,
              followingId, 
            },
          });
    
        }

      

  }