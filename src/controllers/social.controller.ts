import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR, SOCIAL_ERRORS } from '../constants/errors';
import { SOCIAL_RESPONSE } from '../constants/successMessages';
import SocialService from '../services/social.service';
import apiResponse from '../utilities/apiResponse';

export class SocialController {
    public static async createPost(req,res) {
        const { accountId } = req.params;
        const { newPost } = req.body;
    
        try {
          const createdPost = await SocialService.createPost(
            accountId,
            newPost,
          );
          return apiResponse.result(
            res,
            {
              message: SOCIAL_RESPONSE.POST_CREATE ,
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

      public static async likePost(req,res) {
          const { postId } = req.params; 
          const { user } = req; 

          try {
              await SocialService.likePost(postId, user.accountId); 
              return apiResponse.result(
                  res, 
                  { message: SOCIAL_RESPONSE.POST_LIKED},
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

        public static async unlikePost(req,res) {
            const { postId } = req.params; 
            const { user } = req; 
  
            try {
                await SocialService.unlikePost(postId, user.accountId); 
                return apiResponse.result(
                    res, 
                    { message: SOCIAL_RESPONSE.POST_UNLIKED},
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
      
    }
