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
  '/course/lesson/video',
  '/course/lesson/assessment-video',
];

/**
 * Uploading files constant
 */
export const ALLOWED_DOCUMENT_FILE_TYPES = ['.docx', '.pdf', '.doc'];
export const ALLOWED_IMG_FILE_TYPES = ['.jpeg', '.jpg', '.png'];
export const ALLOWED_VIDEO_FILE_TYPES = ['.mp4', '.mov'];

/**
 * API constants
 */
export const BACKEND_API = 'http://localhost:5000/api';
export const RESET_PASSWORD_URL = 'http://localhost:3000/auth';

/**
 * Purchasing related constants
 */
export const CURRENCY = 'SGD';
export const ORDER_INTENT = 'sale';
export const STARTING_BALANCE = '0.00';
