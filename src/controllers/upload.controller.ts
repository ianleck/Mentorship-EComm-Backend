import httpStatusCodes from 'http-status-codes';
import apiResponse from '../utilities/apiResponse';
import UserService from '../services/user.service';
import logger from '../config/logger';
import { USER_TYPE_ENUM } from '../constants/enum';
import { ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import { UPLOAD_ERRORS } from '../constants/errors';

import { ALLOWED_TRANSCRIPT_FILE_TYPES } from '../constants/constants';
export class UploadController {
  public static async uploadTranscript(req, res) {
    const { accountId } = req.user;

    try {
      if (!req.files || Object.keys(req.files).length === 0)
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      const file = req.files.file;
      const fileType = Utility.getFileType(file.name);

      // if fileType is not .docx / .pdf / . doc, return error;
      if (ALLOWED_TRANSCRIPT_FILE_TYPES.indexOf(fileType) == -1)
        throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);

      const saveFilePath = `${__dirname}/../../uploads/transcript/${accountId}${fileType}`;
      file.mv(saveFilePath, async (err) => {
        if (err) {
          logger.error('[uploadController.uploadTranscript]:' + err.message);
          throw new Error('Failed to save file');
        } else {
          // update user transcript file path
          const user = await UserService.updateUser(accountId, {
            transcriptUrl: saveFilePath,
          });
          return apiResponse.result(
            res,
            { message: 'Successfully Uploaded Transcript', user },
            httpStatusCodes.OK
          );
        }
      });
    } catch (e) {
      logger.error('[uploadController.uploadTranscript]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
        message: e.message,
      });
    }
  }
}
