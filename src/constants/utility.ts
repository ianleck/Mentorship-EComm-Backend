const uuid = require('uuid');
import { UPLOAD_ERRORS } from '../constants/errors';

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
}
