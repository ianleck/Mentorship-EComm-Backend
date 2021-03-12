export const TEMPLATES = {
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

  acceptContract: {
    fileName: 'acceptContract.ejs',
    subject:
      '[DigiDojo] Congratulations! Your Mentorship Application has been approved!',
  },
  rejectContract: {
    fileName: 'rejectContract.ejs',
    subject: '[DigiDojo] Mentorship Application Rejected',
  },

  acceptSensei: {
    fileName: 'acceptSensei.ejs',
    subject: '[DigiDojo] Congratulations! You have been approved as a Sensei!',
  },

  rejectSensei: {
    fileName: 'rejectSensei.ejs',
    subject: '[DigiDojo] Sensei Profile Rejected',
  },

  acceptCourse: {
    fileName: 'acceptCourse.ejs',
    subject:
      '[DigiDojo] Congratulations! Your Course has been approved!',
  },
  rejectCourse: {
    fileName: 'rejectCourse.ejs',
    subject: '[DigiDojo] Course Rejected',
  },
};
