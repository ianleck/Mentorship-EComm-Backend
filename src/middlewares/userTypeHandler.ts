import { ADMIN_PERMISSION_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import httpStatusCodes from 'http-status-codes';

export const requireStudent = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM.STUDENT) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSensei = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM.SENSEI) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.userType != USER_TYPE_ENUM.ADMIN) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (
    req.user.userType != USER_TYPE_ENUM.ADMIN ||
    req.user.permission != ADMIN_PERMISSION_ENUM.SUPERADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};
