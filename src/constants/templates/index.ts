export const TEMPLATES = {
  // ======================================== AUTH ========================================
  register: {
    fileName: 'register.ejs',
    subject: '[DigiDojo] Welcome to DigiDojo!',
  },
  forgotPassword: {
    fileName: 'forgotPassword.ejs',
    subject: '[DigiDojo] Password Reset Request',
  },
  passwordReset: {
    fileName: `passwordReset.ejs`,
    subject: '[DigiDojo] Password has been successfully reset!',
  },

  // ======================================== COMMENTS ========================================
  deleteOffensiveComment: {
    fileName: 'deleteOffensiveComment.ejs',
    subject:
      '[DigiDojo] Your comment has been deemed offensive and has been deleted',
  },
  // ======================================== COURSE ========================================
  acceptCourse: {
    fileName: 'acceptCourse.ejs',
    subject: '[DigiDojo] Congratulations! Your Course has been approved!',
  },
  rejectCourse: {
    fileName: 'rejectCourse.ejs',
    subject: '[DigiDojo] Course Rejected',
  },

  // ======================================== MENTORSHIP CONTRACTS ========================================
  acceptContract: {
    fileName: 'acceptContract.ejs',
    subject:
      '[DigiDojo] Congratulations! Your Mentorship Application has been approved!',
  },
  rejectContract: {
    fileName: 'rejectContract.ejs',
    subject: '[DigiDojo] Mentorship Application Rejected',
  },

  // ======================================== SENSEI ========================================

  acceptSensei: {
    fileName: 'acceptSensei.ejs',
    subject: '[DigiDojo] Congratulations! You have been approved as a Sensei!',
  },
  rejectSensei: {
    fileName: 'rejectSensei.ejs',
    subject: '[DigiDojo] Sensei Profile Rejected',
  },

  // ======================================== FINANCE ========================================

  withdrawalFailure: {
    fileName: 'withdrawalFailure.ejs',
    subject: '[DigiDojo] Your withdrawal application has been rejected.',
  },

  withdrawalSuccess: {
    fileName: 'withdrawalSuccess.ejs',
    subject:
      '[DigiDojo] Your withdrawal application has been successfully approved!',
  },
};
