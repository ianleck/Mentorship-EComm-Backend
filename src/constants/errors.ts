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

  USER_BANNED: 'User has been banned',
};

export const CART_ERRORS = {
  CART_MISSING: 'Shopping Cart is already empty',
  COURSE_ALREADY_ADDED: 'Course has already been added to shopping cart',
  COURSE_PURCHASED: 'Course has already been purchased',
  MENTORSHIP_CONTRACT_ADDED:
    'Mentorship Listing has already been added to shopping cart',
  ITEM_MISSING: 'There is no such item in shopping cart',
};

export const COURSE_ERRORS = {
  COURSE_MISSING: 'Course does not exist',
  COURSE_DRAFT_MISSING: 'Course draft does not exist',
  CONTRACT_EXISTS:
    'A course contract has already been made for this course. Please edit existing course contract.',
  CONTRACT_MISSING:
    'Course contract does not exist. Please sign up for the course first.',
  DELETE_DISALLOWED:
    'Digi Dojo does not allow any deletion of published courses',
  LESSON_MISSING: 'Lesson does not exist',
  ANNOUNCEMENT_MISSING: 'Annoucement does not exist',
  USER_NOT_VERIFIED:
    'Your account has not been verified by Diji Dojo. Please complete your verification first before publishing your course or submitting your course request for approval.',
  COURSE_NOT_VERIFIED:
    'Course has not been approved yet. Please submit your course for approval before publishing it.',
  COURSE_NOT_ACCEPTED:
    'Course has not been approved yet. Please submit your course for approval before creating an announcement.',
};

export const MENTORSHIP_ERRORS = {
  UNAUTH_LISTING:
    'You lack the required permission to create a mentorship listing.',
  LISTING_MISSING: 'Listing does not exist',
  CONTRACT_EXISTS:
    'A mentorship contract has already been made for this mentor. Please edit existing mentorship contract.',
  CONTRACT_MISSING:
    'Mentorship contract does not exist. Please sign up for a mentorship listing first.',
  TESTIMONIAL_EXISTS:
    'A testimonial has already been made for this mentee. Please edit existing testimonial.',
  TESTIMONIAL_MISSING: 'Testimonial does not exist',
  CONTRACT_NOT_COMPLETED:
    'Mentorship contract has not been completed or does not exist. Please only add a testimonial for completed mentorships.',
  USER_NOT_VERIFIED:
    'Your account has not been verified by Diji Dojo. Please complete your verification first before publishing your mentorship listing.',
  TASK_BUCKET_MISSING: 'Task bucket does not exist',
  TASK_MISSING: 'Task does not exist',
};

export const REVIEW_ERRORS = {
  REVIEW_EXISTS: 'You have already posted a review',
  REVIEW_MISSING: 'Review does not exist',
};

export const UPLOAD_ERRORS = {
  INVALID_FILE_TYPE: 'Invalid File Type',
  NO_FILE_UPLOADED: 'No files were uploaded',
  ZIP_FILE_ALLOWED: 'Only zip files are allowed',
  FAILED_TRANSCRIPT_SAVE: 'Failed to save transcript',
  FAILED_IMAGE_SAVE: 'Failed to save image',
  FAILED_CV_SAVE: 'Failed to save CV',
  FAILED_VIDEO_SAVE: 'Failed to save video',
  FILE_MISSING: 'File does not exist',
  FAILED_FILE_SAVE: 'Failed to save file',
};

export const REGISTER_ERRORS = {
  USER_EXISTS: 'Email/Username already exists',
  ADMIN_EXISTS: 'Email already exists',
};

export const RESPONSE_ERROR = {
  RES_ERROR: 'Unable to perform request',
};

export const WALLET_ERROR = {
  UNAUTH_WALLET: 'User does not have access to requested wallet',
  EXISTING_WITHDRAWAL:
    'An existing withdrawal application has been made. Please wait while we process your withdrawal application.',
  MISSING_BILLING: 'No such billing exists in the system',
  NO_MONEY:
    'Unable to withdraw as confirmed amount is still 0. Please note that 120 days have to elapse before pending amount is converted to confirmed amount due to our user refund policies',
  PAID_OUT: 'This withdrawal application has already been approved.',
};

export const SOCIAL_ERRORS = {
  POST_MISSING: 'Post does not exist',

  FOLLOWING_REQUEST_MISSING: 'Request does not exist',
  FOLLOWING_MISSING: 'User is not following',

  PRIVATE_USER: 'User account is private',
};

export const COMMENT_ERRORS = {
  COMMENT_MISSING: 'Comment does not exist',
};

export const COMPLAINT_ERRORS = {
  COMPLAINT_REASON_EXISTS: 'Similar complaint reason already exists',

  COMPLAINT_MISSING: 'Complaint does not exist',
  COMPLAINT_ALREADY_EXISTS: 'You have submitted a complaint previously',
};
