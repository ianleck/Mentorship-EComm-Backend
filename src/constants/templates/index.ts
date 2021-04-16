export const TEMPLATES = {
  // ======================================== AUTH ========================================
  register: {
    fileName: 'register.ejs',
    subject: 'Welcome to DigiDojo!',
  },
  forgotPassword: {
    fileName: 'forgotPassword.ejs',
    subject: 'Password Reset Request',
  },
  passwordReset: {
    fileName: `passwordReset.ejs`,
    subject: 'Password has been successfully reset!',
  },

  // ======================================== COMMENTS ========================================
  deleteOffensiveComment: {
    fileName: 'deleteOffensiveComment.ejs',
    subject: 'Your comment has been deemed offensive and has been deleted',
  },
  // ======================================== COURSE ========================================
  acceptCourse: {
    fileName: 'acceptCourse.ejs',
    subject: 'Congratulations! Your Course has been approved!',
  },
  rejectCourse: {
    fileName: 'rejectCourse.ejs',
    subject: 'Course Rejected',
  },

  newAnnouncement: {
    fileName: 'newAnnouncement.ejs',
    subject: 'New Announcement',
  },

  // ======================================== MENTORSHIP CONTRACTS ========================================
  acceptContract: {
    fileName: 'acceptContract.ejs',
    subject: 'Congratulations! Your Mentorship Application has been approved!',
  },
  rejectContract: {
    fileName: 'rejectContract.ejs',
    subject: 'Mentorship Application Rejected',
  },

  // ======================================== SENSEI ========================================

  acceptSensei: {
    fileName: 'acceptSensei.ejs',
    subject: 'Congratulations! You have been approved as a Sensei!',
  },
  rejectSensei: {
    fileName: 'rejectSensei.ejs',
    subject: 'Sensei Profile Rejected',
  },

  // ======================================== FINANCE ========================================

  refundFailure: {
    fileName: 'refundFailure.ejs',
    subject: 'Your refund request has been rejected.',
  },

  refundSuccess: {
    fileName: 'refundSuccess.ejs',
    subject: 'Your refund request has been successfully approved!',
  },

  withdrawalFailure: {
    fileName: 'withdrawalFailure.ejs',
    subject: 'Your withdrawal application has been rejected.',
  },

  withdrawalSuccess: {
    fileName: 'withdrawalSuccess.ejs',
    subject: 'Your withdrawal application has been successfully approved!',
  },
};
