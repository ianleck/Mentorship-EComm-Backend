/**
 * Jwt secret needed for passport.ts
 */
export const JWT_SECRET = 'is4103';

/**
 * For index.ts when instantiating server
 */
export const BASE = '/api';
export const CHILD_FOLDERS = [
  '/transcript',
  '/dp',
  '/cv',
  '/course',
  '/course/image',
  '/course/lesson',
  '/course/lesson/file',
  '/course/lesson/video',
  '/course/lesson/assessment-video',
  '/mentorship',
  '/mentorship/task',
];

/**
 * Uploading files constant
 */
export const ALLOWED_DOCUMENT_FILE_TYPES = ['.docx', '.pdf', '.doc'];
export const ALLOWED_IMG_FILE_TYPES = ['.jpeg', '.jpg', '.png'];
export const ALLOWED_VIDEO_FILE_TYPES = ['.mp4', '.mov'];
export const ALLOWED_ZIP_FILE = ['.zip'];
export const ALLOWED_ATTACHEMENT_TYPES = ['.docx', '.pdf', '.doc', '.zip'];

/**
 * API constants
 */
export const BACKEND_API = 'http://localhost:5000/api';
// export const BACKEND_API = 'https://321adf23df2.ngrok.io'; // to be replaced with ngrok
// export const FRONTEND_APIS = 'http://localhost:3000';
export const FRONTEND_APIS = [
  'http://localhost:3000',
  'https://1517c6fa4b70.ngrok.io',
]; // To be replaced with ngrok.
export const RESET_PASSWORD_URL = 'http://localhost:3000/auth';

/**
 * Purchasing related constants
 */
export const CURRENCY = 'SGD';
export const ORDER_INTENT = 'sale';
export const PAYMENT_METHOD = 'paypal';
export const STARTING_BALANCE = 0.0;
export const MARKET_FEE = 0.07; // 5% + 2% (payout fee)
export const PAYPAL_FEE = 0.034;
export const WITHDRAWAL_DAYS = 120;
export const WITHDRAWAL_TITLE = 'Withdrawal has been successfully approved';
export const RECIPIENT_TYPE = 'EMAIL';
