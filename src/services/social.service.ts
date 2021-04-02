import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { FOLLOWING_ENUM } from '../constants/enum';
import { ERRORS, SOCIAL_ERRORS } from '../constants/errors';
import { LikePost } from '../models/LikePost';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { UserFollowership } from '../models/UserFollowership';

export default class SocialService {
  // ======================================== POSTS ========================================
  public static async createPost(
    accountId: string,
    post: {
      content: string;
    }
  ): Promise<Post> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const { content } = post;

    const newPost = new Post({
      accountId,
      content,
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
      postId,
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

  public static async getUserFeed(accountId: string, userId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Check if user account is private, if private, only user followers can see feed
    if (user.isPrivateProfile === true && userId !== accountId) {
      const following = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: accountId,
        },
      });
      if (!following) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    const listOfPost = Post.findAll({
      where: { accountId },
    });
    return listOfPost;
  }

  // ======================================== FOLLOWING ========================================

  //Cancel request to follow a user
  public static async removeRequest(followingId: string, followerId: string) {
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.PENDING,
      },
    });

    if (!followership) throw new Error(SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING);

    await UserFollowership.destroy({
      where: {
        followerId,
        followingId,
      },
    });
  }

  //Approve user follow request
  public static async acceptFollowingRequest(
    followerId: string,
    followingId: string
  ) {
    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.PENDING,
      },
    });

    if (!followership) throw new Error(SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING);

    await followership.update({
      followingStatus: FOLLOWING_ENUM.APPROVED,
    });
  }

  //Reject user follow request (user can request again in future)
  public static async rejectFollowingRequest(
    followerId: string,
    followingId: string
  ) {
    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.PENDING,
      },
    });

    if (!followership) throw new Error(SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING);

    await UserFollowership.destroy({
      where: {
        followerId,
        followingId,
      },
    });
  }

  //Follow a user
  public static async followUser(followingId: string, followerId: string) {
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    if (followingUser.isPrivateProfile === true) {
      const followership = new UserFollowership({
        followingId,
        followerId,
        followingStatus: FOLLOWING_ENUM.PENDING,
      });

      await followership.save();

      return followership;
    }

    const followership = new UserFollowership({
      followingId,
      followerId,
      followingStatus: FOLLOWING_ENUM.APPROVED,
    });

    await followership.save();

    return followership;
  }

  //Unfollow a user (done by user who is following)
  public static async unfollowUser(followingId: string, followerId: string) {
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.APPROVED,
      },
    });

    if (!followership) throw new Error(SOCIAL_ERRORS.FOLLOWING_MISSING);

    await UserFollowership.destroy({
      where: {
        followerId,
        followingId,
      },
    });
  }

  //Remove User (done by user who is being followed)
  public static async removeUserFromFollowingList(
    followerId: string,
    followingId: string
  ) {
    const followerUser = await User.findByPk(followerId);
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.APPROVED,
      },
    });

    if (!followership) throw new Error(SOCIAL_ERRORS.FOLLOWING_MISSING);

    await UserFollowership.destroy({
      where: {
        followerId,
        followingId,
      },
    });
  }

  public static async getFollowingList(accountId: string, userId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Check if user account is private, if private, only user followers can see list
    if (user.isPrivateProfile === true && userId !== accountId) {
      const following = await UserFollowership.findOne({
        where: {
          followingId: accountId,
          followerId: userId,
        },
      });
      if (!following) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    const followingList = UserFollowership.findAll({
      where: {
        followerId: { [Op.eq]: accountId },
        followingStatus: {
          [Op.eq]: [FOLLOWING_ENUM.APPROVED],
        },
      },
    });

    return followingList;
  }

  public static async getFollowerList(accountId: string, userId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Check if user account is private, if private, only user followers can see list
    if (user.isPrivateProfile === true && userId !== accountId) {
      const following = await UserFollowership.findOne({
        where: {
          followingId: accountId,
          followerId: userId,
        },
      });
      if (!following) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    const followerList = UserFollowership.findAll({
      where: {
        followingId: { [Op.eq]: accountId },
        followingStatus: {
          [Op.eq]: [FOLLOWING_ENUM.APPROVED],
        },
      },
      include: [
        {
          model: User,
          attributes: [
            'firstName',
            'lastName',
            'profileImgUrl',
            'isPrivateProfile',
          ],
        },
      ],
    });

    return followerList;
  }

  public static async getPendingFollowingList(
    accountId: string,
    userId: string
  ) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Check if user retrieving pending list is the owner of account
    if (userId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const pendingFollowingList = UserFollowership.findAll({
      where: {
        followerId: { [Op.eq]: accountId },
        followingStatus: {
          [Op.eq]: [FOLLOWING_ENUM.PENDING],
        },
      },
    });

    return pendingFollowingList;
  }
}
