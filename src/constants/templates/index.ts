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
  acceptStudent: {
    fileName: 'acceptStudent.ejs',
    subject:
      '[DigiDojo] Congratulations! Your Mentorship Application has been approved!',
  },
  rejectStudent: {
    fileName: 'rejectStudent.ejs',
    subject: '[DigiDojo] Mentorship Application Rejected',
  },
};
