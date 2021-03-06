import { ADMIN_PERMISSION_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import httpStatusCodes from 'http-status-codes';
import logger from "../config/logger";

export const downloadAuthentication = (req, res, next) => {
  const { user } = req;
  const { documentName } = req.params;

  // continue if admin$ ≈
  if (user.userType === USER_TYPE_ENUM.ADMIN) return next();

  const _documentName = documentName.split('.');
  if (_documentName.length <= 0) {
    logger.error('Invalid file name');
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: 'Invalid file name',
    });
  }

  const documentId = _documentName[0];

  // check that document belongs to user
  // document name is saved in the form of <accountId>.<file extension>
  // eg. 1243123.docx
  if (user.accountId === documentId) {
    next();
  } else {
    return res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  }
};

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
