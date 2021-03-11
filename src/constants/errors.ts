export const ERRORS = {
  ADMIN_DOES_NOT_EXIST: 'Admin does not exist',
  SENSEI_DOES_NOT_EXIST: 'Sensei does not exist',
  STUDENT_DOES_NOT_EXIST: 'Student does not exist',
  USER_DOES_NOT_EXIST: 'User does not exist',
  EXPERIENCE_DOES_NOT_EXIST: 'Experience does not exist',
  SENSEI_NOT_PENDING:
    'Sensei has either not been found or is not pending approval',
};

export const AUTH_ERRORS = {
  INVALID_TOKEN: 'Invalid or expired password reset token',

  NEW_PASSWORD_MISMATCH: 'New password does not match',
  NEW_PASSWORD_CANNOT_BE_OLD_PASSWORD:
    'New Password cannot be the same as the Old Password',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',

  USER_EXISTS: 'Email/Username already exists',
  ADMIN_EXISTS: 'Email already exists',
};

export const COURSE_ERRORS = {
  COURSE_MISSING: 'Course does not exist',
  COURSE_DRAFT_MISSING: 'Course draft does not exist',
  CONTRACT_EXISTS:
    'A course contract has already been made for this course. Please edit existing course contract.',
  CONTRACT_MISSING:
    'Course contract does not exist. Please sign up for the course first.',
  LESSON_MISSING: 'Lesson does not exist',
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

  FAILED_TRANSCRIPT_SAVE: 'Failed to save transcript',
  FAILED_IMAGE_SAVE: 'Failed to save image',
  FAILED_CV_SAVE: 'Failed to save CV',
};

export const REGISTER_ERRORS = {
  USER_EXISTS: 'Email/Username already exists',
  ADMIN_EXISTS: 'Email already exists',
};

export const RESPONSE_ERROR = {
  RES_ERROR: 'Unable to perform request',
};
