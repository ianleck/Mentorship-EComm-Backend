import {
  ADMIN_PERMISSION_ENUM_OPTIONS,
  USER_TYPE_ENUM_OPTIONS,
} from '../constants/enum';
import httpStatusCodes from 'http-status-codes';

export const requireStudent = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM_OPTIONS.STUDENT) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSensei = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM_OPTIONS.SENSEI) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (
    req.user.userType != USER_TYPE_ENUM_OPTIONS.ADMIN ||
    req.user.permission != ADMIN_PERMISSION_ENUM_OPTIONS.SUPERADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};
