const uuid = require('uuid');

export default class Utility {
  // helps to catch async errors
  public static asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
