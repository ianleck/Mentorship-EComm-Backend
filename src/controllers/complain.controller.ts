import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, RESPONSE_ERROR, SOCIAL_ERRORS } from '../constants/errors';
import { SOCIAL_RESPONSE } from '../constants/successMessages';
import SocialService from '../services/social.service';
import apiResponse from '../utilities/apiResponse';

export class ComplainController {
  // =================================================== POSTS ===================================================
  // public static async createCommentComplain(req, res) {
  //   const { commentId } = req.params;
  //   const { complain } = req.body;
  //   try {
  //     const createdPost = await SocialService.createPost(accountId, newPost);
  //     return apiResponse.result(
  //       res,
  //       {
  //         message: SOCIAL_RESPONSE.POST_CREATE,
  //         post: createdPost,
  //       },
  //       httpStatusCodes.CREATED
  //     );
  //   } catch (e) {
  //     logger.error('[complainController.createPost]:' + e.message);
  //     if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
  //       return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
  //         message: e.message,
  //       });
  //     }
  //     return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
  //       message: RESPONSE_ERROR.RES_ERROR,
  //     });
  //   }
  // }
}
