import httpStatusCodes from 'http-status-codes';
import { UPLOAD_RESPONSE } from 'src/constants/successMessages';
import logger from '../config/logger';
import {
  ALLOWED_DOCUMENT_FILE_TYPES,
  ALLOWED_IMG_FILE_TYPES,
  BACKEND_API,
} from '../constants/constants';
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { ERRORS, RESPONSE_ERROR, UPLOAD_ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import { User } from '../models/User';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';

export class UploadController {
  public static async uploadCv(req, res) {
    const { accountId } = req.user;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const fileType = Utility.getFileType(file.name);

      // if fileType is not .docx / .pdf / . doc, return error;
      if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
        throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
      }

      // path to save in db. 'upload' because /upload is the route
      // const saveName = `${BACKEND_API}/upload/transcript/${accountId}${fileType}`;
      const url = `cv/${accountId}${fileType}`;
      const saveName = `${BACKEND_API}/file/${url}`;

      // path to save file in /uploads/transcript folder
      const saveFilePath = `${__dirname}/../../uploads/${url}`;

      // save file
      file.mv(saveFilePath, async (err) => {
        if (err) {
          logger.error('[uploadController.uploadCv]:' + err.message);
          return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
            message: UPLOAD_ERRORS.FAILED_CV_SAVE,
          });
        } else {
          // update user CV URL
          const user = await User.findByPk(accountId);
          if (user) {
            await user.update({ cvUrl: saveName });
          } else {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
          }

          if (
            user.transcriptUrl &&
            user.adminVerified === ADMIN_VERIFIED_ENUM.SHELL
          ) {
            await user.update({
              adminVerified: ADMIN_VERIFIED_ENUM.PENDING,
            });
          }
          return apiResponse.result(
            res,
            { message: UPLOAD_RESPONSE.CV_UPLOAD, user },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[uploadController.uploadCv]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadTranscript(req, res) {
    const { accountId } = req.user;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const fileType = Utility.getFileType(file.name);

      // if fileType is not .docx / .pdf / . doc, return error;
      if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
        throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
      }

      // path to save in db. 'upload' because /upload is the route
      // const saveName = `${BACKEND_API}/upload/transcript/${accountId}${fileType}`;
      const url = `transcript/${accountId}${fileType}`;
      const saveName = `${BACKEND_API}/file/${url}`;

      // path to save file in /uploads/transcript folder
      const saveFilePath = `${__dirname}/../../uploads/${url}`;

      // save file
      file.mv(saveFilePath, async (err) => {
        if (err) {
          logger.error('[uploadController.uploadTranscript]:' + err.message);
          return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
            message: UPLOAD_ERRORS.FAILED_TRANSCRIPT_SAVE,
          });
        } else {
          // update user transcript file path
          const user = await User.findByPk(accountId);
          if (user) {
            await user.update({ transcriptUrl: saveName });
          } else {
            throw new Error(ERRORS.USER_DOES_NOT_EXIST);
          }

          if (user.cvUrl && user.adminVerified === ADMIN_VERIFIED_ENUM.SHELL) {
            await user.update({
              adminVerified: ADMIN_VERIFIED_ENUM.PENDING,
            });
          }
          return apiResponse.result(
            res,
            { message: UPLOAD_RESPONSE.TRANSCRIPT_UPLOAD, user },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[uploadController.uploadTranscript]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadProfilePic(req, res) {
    const { accountId } = req.user;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const fileType = Utility.getFileType(file.name);

      // if fileType is not .docx / .pdf / . doc, return error;
      if (ALLOWED_IMG_FILE_TYPES.indexOf(fileType) == -1) {
        throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
      }

      // path to save in db. 'upload' because /upload is the route
      const url = `dp/${accountId}${fileType}`;
      const saveName = `${BACKEND_API}/file/${url}`;

      // path to save file in /uploads/dp folder
      const saveFilePath = `${__dirname}/../../uploads/${url}`;

      /// save file
      file.mv(saveFilePath, async (err) => {
        if (err) {
          logger.error('[uploadController.uploadProfilePic]:' + err.message);
          return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
            message: UPLOAD_ERRORS.FAILED_IMAGE_SAVE,
          });
        } else {
          // update user profile image url
          const user = await UserService.updateUser(accountId, {
            profileImgUrl: saveName,
          });
          return apiResponse.result(
            res,
            { message: UPLOAD_RESPONSE.PROFILE_PIC_UPLOAD, user },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[uploadController.uploadProfilePic]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
