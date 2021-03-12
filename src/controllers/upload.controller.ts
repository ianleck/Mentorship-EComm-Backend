import httpStatusCodes from 'http-status-codes';
import { UPLOAD_RESPONSE } from '../constants/successMessages';
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
import UploadService from '../services/uploadService';
export class UploadController {
  // ================================ USER RELATED UPLOADS ================================
  public static async uploadCv(req, res) {
    const { accountId } = req.user;
    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadCv(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.CV_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadCv]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_CV_SAVE
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

  public static async uploadTranscript(req, res) {
    const { accountId } = req.user;
    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadTranscript(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.TRANSCRIPT_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadTranscript]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_TRANSCRIPT_SAVE
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

  public static async uploadProfilePic(req, res) {
    const { accountId } = req.user;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadProfilePic(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.PROFILE_PIC_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadProfilePic]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_IMAGE_SAVE
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

  // ================================ COURSE RELATED UPLOADS ================================
  public static async uploadCoursePic(req, res) {
    const { accountId } = req.user;
    const { courseId } = req.params;

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
      const url = `course/${accountId}${fileType}`;
      const saveName = `${BACKEND_API}/file/${url}`;

      // path to save file in /uploads/dp folder
      const saveFilePath = `${__dirname}/../../uploads/${url}`;

      /// save file
      file.mv(saveFilePath, async (err) => {
        if (err) {
          logger.error('[uploadController.uploadProfilePic]:' + err.message);
          return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
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
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE
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
