import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { USER_TYPE_ENUM } from '../constants/enum';

export const checkPermission = (req, res, next) => {
  const { user } = req;
  const { documentName } = req.params;

  // continue if admin
  if (user.userType == USER_TYPE_ENUM.ADMIN) next();

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
