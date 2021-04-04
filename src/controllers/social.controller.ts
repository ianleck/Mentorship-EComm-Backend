import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { FOLLOWING_ENUM } from '../constants/enum';
import { ERRORS, RESPONSE_ERROR, SOCIAL_ERRORS } from '../constants/errors';
import { SOCIAL_RESPONSE } from '../constants/successMessages';
import SocialService from '../services/social.service';
import apiResponse from '../utilities/apiResponse';

export class SocialController {
  //================================== POSTS =============================================

  public static async createPost(req, res) {
    const { accountId } = req.params;
    const { newPost } = req.body;

    try {
      const createdPost = await SocialService.createPost(accountId, newPost);
      return apiResponse.result(
        res,
        {
          message: SOCIAL_RESPONSE.POST_CREATE,
          post: createdPost,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[socialController.createPost]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async editPost(req, res) {
    const { user } = req;
    const { postId } = req.params;
    const { editedPost } = req.body;
    try {
      const updatedPost = await SocialService.editPost(
        user.accountId,
        postId,
        editedPost
      );
      return apiResponse.result(
        res,
        {
          message: SOCIAL_RESPONSE.POST_UPDATE,
          post: updatedPost,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.editPost]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === SOCIAL_ERRORS.POST_MISSING
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

  public static async deletePost(req, res) {
    const { user } = req;
    const { postId } = req.params;
    try {
      await SocialService.deletePost(postId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.POST_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.deletePost]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === SOCIAL_ERRORS.POST_MISSING
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

  public static async likePost(req, res) {
    const { postId } = req.params;
    const { user } = req;

    try {
      await SocialService.likePost(postId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.POST_LIKED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.likePost]:' + e.message);
      if (
        e.message === SOCIAL_ERRORS.POST_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async unlikePost(req, res) {
    const { postId } = req.params;
    const { user } = req;

    try {
      await SocialService.unlikePost(postId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.POST_UNLIKED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.unlikePost]:' + e.message);
      if (
        e.message === SOCIAL_ERRORS.POST_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async getUserFeed(req, res) {
    const { accountId } = req.params;
    const { user } = req;

    try {
      const listOfPost = await SocialService.getUserFeed(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          listOfPost,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialService.getUserFeed]:' + e.toString());
      if (e.message === SOCIAL_ERRORS.PRIVATE_USER) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  //================================== FOLLOWING =============================================

  public static async removeRequest(req, res) {
    const { accountId } = req.params; //accountId of following
    const { user } = req; //follower

    try {
      await SocialService.removeRequest(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.FOLLOWING_REQUEST_CANCELLED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.removeRequest]:' + e.message);
      if (
        e.message === SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async acceptFollowingRequest(req, res) {
    const { accountId } = req.params; //accountId of follower
    const { user } = req; //following

    try {
      await SocialService.acceptFollowingRequest(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.FOLLOWING_REQUEST_ACCEPTED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.acceptFollowingRequest]:' + e.message);
      if (
        e.message === SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async rejectFollowingRequest(req, res) {
    const { accountId } = req.params; //accountId of follower
    const { user } = req; //following

    try {
      await SocialService.rejectFollowingRequest(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.FOLLOWING_REQUEST_REJECTED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.rejectFollowingRequest]:' + e.message);
      if (
        e.message === SOCIAL_ERRORS.FOLLOWING_REQUEST_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async followUser(req, res) {
    const { accountId } = req.params; //accountId of following
    const { user } = req; //follower

    try {
      const response = await SocialService.followUser(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message:
            response.followingStatus === FOLLOWING_ENUM.APPROVED
              ? SOCIAL_RESPONSE.FOLLOWING_ADDED
              : SOCIAL_RESPONSE.FOLLOWING_REQUEST_CREATED,
          followingStatus: response.followingStatus,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.followUser]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async unfollowUser(req, res) {
    const { accountId } = req.params; //accountId of following
    const { user } = req; //follower

    try {
      await SocialService.unfollowUser(accountId, user.accountId);
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.FOLLOWING_REMOVED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.unfollowUser]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === SOCIAL_ERRORS.FOLLOWING_MISSING
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

  public static async removeUserFromFollowingList(req, res) {
    const { accountId } = req.params; //accountId of follower
    const { user } = req; //following

    try {
      await SocialService.removeUserFromFollowingList(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: SOCIAL_RESPONSE.FOLLOWING_REMOVED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error(
        '[socialController.removeUserFromFollowingList]:' + e.message
      );
      if (
        e.message === SOCIAL_ERRORS.FOLLOWING_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
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

  public static async getFollowingList(req, res) {
    const { accountId } = req.params;
    const { user } = req;

    try {
      const followingList = await SocialService.getFollowingList(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          followingList,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialService.getFollowingList]:' + e.toString());
      if (e.message === SOCIAL_ERRORS.PRIVATE_USER) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getFollowerList(req, res) {
    const { accountId } = req.params;
    const { user } = req;

    try {
      const followerList = await SocialService.getFollowerList(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          followerList,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialService.getFollowerList]:' + e.toString());
      if (e.message === SOCIAL_ERRORS.PRIVATE_USER) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getPendingFollowingList(req, res) {
    const { accountId } = req.params;
    const { user } = req;

    try {
      const pendingFollowingList = await SocialService.getPendingFollowingList(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          pendingFollowingList,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialService.getPendingFollowingList]:' + e.toString());
      if (e.message === SOCIAL_ERRORS.PRIVATE_USER) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async blockUser(req, res) {
    const { accountId } = req.params; //user to block 
    const { user } = req;

    //return blocked status
    try {
      const response = await SocialService.blockUser(accountId, user.accountId);
      return apiResponse.result(
        res,
        {
          message: SOCIAL_RESPONSE.USER_BLOCKED,
          followingStatus: response.followingStatus,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.blockUser]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  //Unblock User
  public static async unblockUser(req, res) {
    const { accountId } = req.params; //user to unblock
    const { user } = req;

    //return profile of user unblocked
    try {
      const userUnblocked = await SocialService.unblockUser(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: SOCIAL_RESPONSE.USER_UNBLOCKED,
          //userUnblocked,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[socialController.unblockUser]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }
}
