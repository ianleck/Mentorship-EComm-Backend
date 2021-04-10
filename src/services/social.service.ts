import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { FOLLOWING_ENUM } from '../constants/enum';
import { ERRORS, SOCIAL_ERRORS } from '../constants/errors';
import { Comment } from '../models/Comment';
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
        accountId,
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
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (!following) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    const listOfPost = Post.findAll({
      where: { accountId },
      include: [
        {
          model: User,
          attributes: ['accountId', 'firstName', 'lastName', 'profileImgUrl'],
        },
        {
          model: LikePost,
          on: {
            '$LikePost.postId$': {
              [Op.col]: 'Post.postId',
            },
          },
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
              ],
            },
          ],
        },
      ],
    });
    return listOfPost;
  }

  public static async getFollowingFeed(accountId: string, userId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Check if user account is private, if private, only user followers can see feed
    if (user.isPrivateProfile === true && userId !== accountId) {
      const following = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: accountId,
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (!following) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    const allFollowingIdsRsp = await UserFollowership.findAll({
      where: {
        followerId: userId,
        followingStatus: FOLLOWING_ENUM.APPROVED,
      },
    });
    const followingIds = allFollowingIdsRsp.map((uf) => uf.followingId);

    const listOfPost = Post.findAll({
      where: { accountId: { [Op.in]: [accountId, ...followingIds] } },
      include: [
        {
          model: User,
          attributes: ['accountId', 'firstName', 'lastName', 'profileImgUrl'],
        },
        {
          model: LikePost,
          on: {
            '$LikePost.postId$': {
              [Op.col]: 'Post.postId',
            },
          },
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
              ],
            },
          ],
        },
      ],
    });
    return listOfPost;
  }

  public static async getPostById(postId: string, userId: string) {
    var isBlocking = false;

    const post = await Post.findOne({
      where: {
        postId,
      },
      include: [
        {
          model: User,
          attributes: ['accountId', 'firstName', 'lastName', 'profileImgUrl'],
        },
        {
          model: LikePost,
          on: {
            '$LikePost.postId$': {
              [Op.col]: 'Post.postId',
            },
          },
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'profileImgUrl',
              ],
            },
          ],
        },
      ],
    });
    if (!post) throw new Error(SOCIAL_ERRORS.POST_MISSING);

    //owner of post
    const userProfile = await User.findByPk(post.accountId);
    if (!userProfile) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //CHECK IF OWNER OF POST HAS BLOCKED USER LOGGED IN
    if (userId !== userProfile.accountId) {
      const followership = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: userProfile.accountId,
          followingStatus: FOLLOWING_ENUM.BLOCKED,
        },
      });
      //return user who blocked
      if (followership) {
        const userProfile = await User.findByPk(post.accountId, {
          attributes: ['accountId'],
        });
        return { post: null, userProfile, isBlocking: true };
      }
    }

    //Check if owner of the post is private, if private, only user followers can see post
    if (
      userProfile.isPrivateProfile === true &&
      userId !== userProfile.accountId
    ) {
      const userProfile = await User.findByPk(post.accountId, {
        attributes: [
          'accountId',
          'username',
          'firstName',
          'lastName',
          'profileImgUrl',
          'isPrivateProfile',
        ],
      });

      const following = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: userProfile.accountId,
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (!following) {
        return { post: null, userProfile, isBlocking };
      }
    }

    return { post, userProfile, isBlocking };
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
          followingStatus: FOLLOWING_ENUM.APPROVED,
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
      include: [
        {
          model: User,
          as: 'Following',
          on: {
            '$Following.accountId$': {
              [Op.col]: 'UserFollowership.followingId',
            },
          },
          attributes: [
            'accountId',
            'username',
            'firstName',
            'lastName',
            'profileImgUrl',
            'isPrivateProfile',
          ],
        },
      ],
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
          followingStatus: FOLLOWING_ENUM.APPROVED,
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
          as: 'Follower',
          on: {
            '$Follower.accountId$': {
              [Op.col]: 'UserFollowership.followerId',
            },
          },
          attributes: [
            'accountId',
            'username',
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

  public static async blockUser(followerId: string, followingId: string) {
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followerUser = await User.findByPk(followerId); //user to block
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //Ensure that the user who blocked is not following the user being blocked anymore
    const followershipToBeDestroyed = await UserFollowership.findOne({
      where: {
        followingId: followerUser.accountId,
        followerId: followingUser.accountId,
      },
    });
    if (followershipToBeDestroyed) {
      await UserFollowership.destroy({
        where: {
          followingId: followerUser.accountId,
          followerId: followingUser.accountId,
        },
      });
    }

    const existingFollowership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
      },
    });
    if (!existingFollowership) {
      const followership = new UserFollowership({
        followingId,
        followerId,
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      });

      await followership.save();

      return followership;
    } else {
      existingFollowership.update({
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      });

      return existingFollowership;
    }
  }

  //Unblock User
  public static async unblockUser(followerId: string, followingId: string) {
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followerUser = await User.findByPk(followerId); //user to unblock
    if (!followerUser) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const followership = await UserFollowership.findOne({
      where: {
        followerId,
        followingId,
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      },
    });

    // if (!followership) return followerUser;

    await UserFollowership.destroy({
      where: {
        followerId,
        followingId,
      },
    });
  }

  // return followerUser;
  public static async getPendingFollowerList(
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

    const pendingFollowerList = UserFollowership.findAll({
      where: {
        followingId: { [Op.eq]: accountId },
        followingStatus: {
          [Op.eq]: [FOLLOWING_ENUM.PENDING],
        },
      },
      include: [
        {
          model: User,
          as: 'Follower',
          on: {
            '$Follower.accountId$': {
              [Op.col]: 'UserFollowership.followerId',
            },
          },
          attributes: [
            'accountId',
            'username',
            'firstName',
            'lastName',
            'profileImgUrl',
            'isPrivateProfile',
          ],
        },
      ],
    });

    return pendingFollowerList;
  }

  public static async getUsersBlocked(accountId: string) {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const usersBlocked = await UserFollowership.findAll({
      where: {
        followingId: accountId,
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      },
      include: [
        {
          model: User,
          as: 'Follower',
          on: {
            '$Follower.accountId$': {
              [Op.col]: 'UserFollowership.followerId',
            },
          },
          attributes: [
            'accountId',
            'username',
            'firstName',
            'lastName',
            'profileImgUrl',
            'isPrivateProfile',
          ],
        },
      ],
    });

    return usersBlocked;
  }
}
