export const ERRORS = {
  ADMIN_DOES_NOT_EXIST: 'Admin does not exist',
  SENSEI_DOES_NOT_EXIST: 'Sensei does not exist',
  STUDENT_DOES_NOT_EXIST: 'Student does not exist',
  USER_DOES_NOT_EXIST: 'User does not exist',
  EXPERIENCE_DOES_NOT_EXIST: 'Experience does not exist',
};

export const AUTH_ERRORS = {
  INVALID_TOKEN: 'Invalid or expired password reset token',
};

export const MENTORSHIP_ERRORS = {
  UNAUTH_LISTING:
    'You lack the required permission to create a mentorship listing.',
  LISTING_MISSING: 'Listing does not exist',
  CONTRACT_EXISTS:
    'A mentorship contract has already been made for this mentor. Please edit existing mentorship contract.',
  CONTRACT_MISSING:
    'No pending mentorship contract found. Please create a mentorship contract',
};

export const UPLOAD_ERRORS = {
  INVALID_FILE_TYPE: 'Invalid File Type',
  NO_FILE_UPLOADED: 'No files were uploaded',
};
