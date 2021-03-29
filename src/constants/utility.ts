const uuid = require('uuid');
import { RESPONSE_ERROR, UPLOAD_ERRORS } from '../constants/errors';
import apiResponse from '../utilities/apiResponse';
import httpStatusCode from 'http-status-codes';
export default class Utility {
  // helps to catch async errors
  public static asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

  public static getFileType(fileName) {
    const split = fileName.split('.');
    if (split.length > 0) {
      return '.' + split[split.length - 1];
    }
    throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
  }

  public static apiErrorResponse(
    res,
    incomingError: Error,
    acceptedErrors?: string[]
  ) {
    // if errors is one of the accepted errors
    if (
      acceptedErrors &&
      acceptedErrors.indexOf(incomingError.message) !== -1
    ) {
      return apiResponse.error(res, httpStatusCode.BAD_REQUEST, {
        message: incomingError.message,
      });
    } else {
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
