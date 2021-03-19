import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ADMIN_ROLE_ENUM, USER_TYPE_ENUM } from '../constants/enum';
const passport = require('passport');

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

export const optionalAuth = async (req, res, next) => {
  const auth = req.header('Authorization');
  if (auth) {
    passport.authenticate('isAuthenticated', { session: false })(
      req,
      res,
      next
    );
  } else {
    next();
  }
};

// check if user is doing actions to his/her own account
export const requireSameUser = (req, res, next) => {
  if (req.user.accountId !== req.params.accountId) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

// check if user is doing actions to his/her own account or if its an admin
export const requireSameUserOrAdmin = (req, res, next) => {
  if (
    req.user.accountId !== req.params.accountId &&
    req.user.userType !== USER_TYPE_ENUM.ADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

/*
  if you are not user && not superadmin, will send error
  if you are user && not superadmin, will not send error
  if you are not user && superadmin, will not send error
*/
export const requireSameUserOrSuperAdmin = (req, res, next) => {
  if (
    req.user.accountId !== req.params.accountId &&
    req.user.role !== ADMIN_ROLE_ENUM.SUPERADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireStudent = (req, res, next) => {
  if (req.user.userType !== USER_TYPE_ENUM.STUDENT) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSensei = (req, res, next) => {
  if (req.user.userType !== USER_TYPE_ENUM.SENSEI) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.userType !== USER_TYPE_ENUM.ADMIN) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireFinance = (req, res, next) => {
  if (
    req.user.userType !== USER_TYPE_ENUM.ADMIN ||
    (req.user.userType === USER_TYPE_ENUM.ADMIN &&
      req.user.role === ADMIN_ROLE_ENUM.ADMIN)
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireFinanceIfAdmin = (req, res, next) => {
  if (
    req.user.userType === USER_TYPE_ENUM.ADMIN &&
    req.user.role === ADMIN_ROLE_ENUM.ADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (
    req.user.userType !== USER_TYPE_ENUM.ADMIN ||
    req.user.role !== ADMIN_ROLE_ENUM.SUPERADMIN
  ) {
    res.status(httpStatusCodes.UNAUTHORIZED).json({
      message: httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
    });
  } else {
    next();
  }
};
