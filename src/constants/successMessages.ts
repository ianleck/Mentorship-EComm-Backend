// ==================== ADMIN RESPONSE MESSAGES ====================
export const ADMIN_RESPONSE = {
  ADMIN_UPDATE: 'Admin has been successfully updated',
  ADMIN_DEACTIVATE: 'Admin has been successfully deactivated',

  ADMIN_ROLE_UPDATE: 'Role of admin has been successfully updated',

  SENSEI_ACCEPT: 'Sensei profile has been successfully accepted',
  SENSEI_REJECT: 'Sensei profile has been successfully rejected',
};

// ==================== AUTH RESPONSE MESSAGES ====================
export const AUTH_RESPONSE = {
  SUCCESSFULLY_REQUESTED_PASSWORD: 'Password Reset link has been requested',
  SUCCESSFULLY_RESET_PASSWORD: 'Password has been successfully reset',
  SUCCESSFULLY_CHANGED_PASSWORD: 'Successfully Changed Password',
};

// ==================== CART RESPONSE MESSAGES ====================
export const CART_RESPONSE = {
  ADD_COURSE_TO_CART: 'Course has been successfully added to cart',
  ADD_MENTORSHIP_TO_CART:
    'Mentorship Passes have been successfully added to cart',
  DELETE_FROM_CART:
    'The selected item(s) have been successfully removed from cart',
  UPDATE_QUANTITY: 'Mentorship Quantity has been successfully updated',
};

// ==================== COMMENT RESPONSE MESSAGES ====================
export const COMMENT_RESPONSE = {
  COMMENT_LESSON_CREATE: 'Successfully commented on lesson',
  COMMENT_DELETE: 'Successfully deleted comment',

  COMMENT_POST_CREATE: 'Successfully commented on post',
  COMMENT_POST_EDIT: 'Successfully edited comment on post',
};

// ==================== COURSE RESPONSE MESSAGES ====================
export const COURSE_RESPONSE = {
  COURSE_CREATE: 'Course Listing has been successfully created',
  COURSE_UPDATE: 'Course Listing has been successfully updated',
  COURSE_DELETE: 'Course Listing has been successfully deleted',

  LESSON_CREATE: 'Lesson has been successfully created',
  LESSON_UPDATE: 'Lesson has been successfully updated',
  LESSON_DELETE: 'Lesson has been successfully deleted',

  NOTE_CREATE: 'Note has been successfully created',
  NOTE_UPDATE: 'Note has been successfully updated',

  COURSE_REQUEST_ACCEPTED: 'Course Request has been successfully accepted',
  COURSE_REQUEST_REJECTED: 'Course Request has been successfully rejected',

  CONTRACT_CREATE: 'Course Contract has been successfully created',
  CONTRACT_UPDATE: 'Course Contract has been successfully updated',
  CONTRACT_DELETE: 'Course Contract has been successfully deleted',
  CONTRACT_ACCEPT: 'Course Contract has been successfully accepted',
  CONTRACT_REJECT: 'Course Contract has been successfully rejected',

  ANNOUNCEMENT_CREATE: 'Announcement has been successfully written',
  ANNOUNCEMENT_UPDATE: 'Announcement has been successfully updated',
  ANNOUNCEMENT_DELETE: 'Announcement has been successfully deleted',

  LESSON_COMPLETED: 'Lesson has been marked as completed',
};

// ==================== MENTORSHIP RESPONSE MESSAGES ====================
export const COMPLAINT_RESPONSE = {
  COMPLAINT_REASON_CREATE: 'Successfully added complaint reason',

  COMPLAINT_CREATE: 'Your complaint has been received',
  COMPLAINT_RESOLVED: 'Complaint has been successfully resolved',
};

// ==================== MENTORSHIP RESPONSE MESSAGES ====================
export const MENTORSHIP_RESPONSE = {
  LISTING_CREATE: 'Mentorship Listing has been successfully created',
  LISTING_UPDATE: 'Mentorship Listing has been successfully updated',
  LISTING_DELETE: 'Mentorship Listing has been successfully deleted',

  CONTRACT_CREATE: 'Mentorship Contract has been successfully created',
  CONTRACT_UPDATE: 'Mentorship Contract has been successfully updated',
  CONTRACT_DELETE: 'Mentorship Contract has been successfully deleted',
  CONTRACT_ACCEPT: 'Mentorship Contract has been successfully accepted',
  CONTRACT_REJECT: 'Mentorship Contract has been successfully rejected',

  TESTIMONIAL_CREATE: 'Testimonial has been successfully created',
  TESTIMONIAL_EDIT: 'Testimonial has been successfully edited',

  TASK_BUCKET_CREATE: 'Task Bucket has been successfully created',
  TASK_BUCKET_EDIT: 'Task Bucket has been successfully edited',
  TASK_BUCKET_DELETE: 'Task Bucket has been successfully deleted',

  TASK_CREATE: 'Task has been successfully created',
  TASK_EDIT: 'Task has been successfully edited',
  TASK_DELETE: 'Task has been successfully deleted',
};

// ==================== REFUND RESPONSE MESSAGES ====================
export const REFUND_RESPONSE = {
  REQUEST_CREATE: 'Refund has been successfully requested',
  REQUEST_CANCEL: 'Refund has been successfully cancelled',
  REQUEST_APPROVE: 'Refund has been successfully approved',
  REQUEST_REJECT: 'Refund has been successfully rejected',
};

// ==================== REVIEW RESPONSE MESSAGES ====================
export const REVIEW_RESPONSE = {
  REVIEW_CREATE: 'Review has been successfully posted',
  REVIEW_UPDATE: 'Review has been successfully updated',
};

// ==================== SOCIAL RESPONSE MESSAGES ====================
export const SOCIAL_RESPONSE = {
  POST_CREATE: 'Post has been successfully created',
  POST_UPDATE: 'Post has been successfully updated',
  POST_DELETE: 'Post has been successfully deleted',
  POST_LIKED: 'Post has been successfully liked',
  POST_UNLIKED: 'Post has been successfully unliked',

  FOLLOWING_ADDED: 'User has been successfully followed',
  FOLLOWING_REMOVED: 'User has been successfullly unfollowed',

  FOLLOWING_REQUEST_CREATED:
    'Request to follow user has been successfully created',
  FOLLOWING_REQUEST_CANCELLED:
    'Request to follow user has been successfully cancelled',
  FOLLOWING_REQUEST_ACCEPTED:
    'Request to follow user has been successfully accepted',
  FOLLOWING_REQUEST_REJECTED:
    'Request to follow user has been successfully rejected',

  USER_BLOCKED: 'User has been successfully blocked',
  USER_UNBLOCKED: 'User has been successfully unblocked',
};

// ==================== USER RESPONSE MESSAGES ====================

export const USER_RESPONSE = {
  USER_UPDATE: 'User has been successfully updated',
  USER_DEACTIVATE: 'User has been successfully deactivated',

  EXPERIENCE_CREATE: 'Experience has been successfully created',
  EXPERIENCE_DELETE: 'Experience has been successfully deleted',
  EXPERIENCE_UPDATE: 'Experience has been successfully updated',

  USER_BANNED: 'User has been successfully banned',
  USER_UNBANNED: 'User has been successfully unbanned',
};

// ==================== UPLOAD RESPONSE MESSAGES ====================
export const UPLOAD_RESPONSE = {
  CV_UPLOAD: 'CV has been uploaded successfully',
  TRANSCRIPT_UPLOAD: 'Transcript has been uploaded successfully',
  PROFILE_PIC_UPLOAD: 'Profile image has been uploaded successfully',
  COURSE_PIC_UPLOAD: 'Course image has been uploaded successfully',
  LESSON_FILE_UPLOAD: 'Successfully uploaded file',
  LESSON_VIDEO_UPLOAD: 'Successfully uploaded video',
  TASK_ATTACHMENT_UPLOAD: 'Successfully uploaded attachment',

  FILE_DELETED: 'Successfully deleted file',
  ATTACHMENT_DELETED: 'Successfully deleted attachment',
};

// ==================== SOCIAL RESPONSE MESSAGES ====================
export const WITHDRAWAL_RESPONSE = {
  REQUEST_CREATE: 'Withdrawal has been successfully requested',
  REQUEST_APPROVE: 'Withdrawal has been successfully approved',
  REQUEST_REJECT: 'Withdrawal has been successfully rejected',
};
