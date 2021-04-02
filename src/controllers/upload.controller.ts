import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  COURSE_ERRORS,
  ERRORS,
  MENTORSHIP_ERRORS,
  RESPONSE_ERROR,
  UPLOAD_ERRORS,
} from '../constants/errors';
import { UPLOAD_RESPONSE } from '../constants/successMessages';
import UploadService from '../services/uploadService';
import apiResponse from '../utilities/apiResponse';
export class UploadController {
  // ================================ USER RELATED UPLOADS ================================
  public static async uploadCv(req, res) {
    const { accountId } = req.user;
    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadCv(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.CV_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadCv]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_CV_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadTranscript(req, res) {
    const { accountId } = req.user;
    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadTranscript(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.TRANSCRIPT_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadTranscript]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_TRANSCRIPT_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadProfilePic(req, res) {
    const { accountId } = req.user;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }
      const file = req.files.file;
      const user = await UploadService.uploadProfilePic(file, accountId);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.PROFILE_PIC_UPLOAD, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadProfilePic]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_IMAGE_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteUserProfileFile(req, res) {
    const { accountId } = req.user;
    const { type } = req.params;
    try {
      const user = await UploadService.deleteUserProfileFile(accountId, type);
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.FILE_DELETED, user },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.deleteUserProfileFile]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === UPLOAD_ERRORS.FILE_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ================================ COURSE RELATED UPLOADS ================================
  public static async uploadCoursePic(req, res) {
    const { accountId } = req.user;
    const { courseId } = req.params;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const course = await UploadService.uploadCoursePic(
        file,
        accountId,
        courseId
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.COURSE_PIC_UPLOAD, course },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadCoursePic]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_IMAGE_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadLessonVideo(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const folder = 'course/lesson/video';
      const lessonAttribute = 'videoUrl';
      const lesson = await UploadService.uploadLessonVideo(
        file,
        accountId,
        lessonId,
        folder,
        lessonAttribute
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.LESSON_VIDEO_UPLOAD, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadLessonVideo]:' + e.message);
      if (
        e.message === COURSE_ERRORS.LESSON_MISSING ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_VIDEO_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadAssessmentVideo(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const folder = 'course/lesson/assessment-video';
      const lessonAttribute = 'assessmentUrl';
      const lesson = await UploadService.uploadLessonVideo(
        file,
        accountId,
        lessonId,
        folder,
        lessonAttribute
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.LESSON_VIDEO_UPLOAD, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadAssessmentVideo]:' + e.message);
      if (
        e.message === COURSE_ERRORS.LESSON_MISSING ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_VIDEO_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async uploadLessonFile(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const lesson = await UploadService.uploadLessonFile(
        file,
        accountId,
        lessonId
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.LESSON_FILE_UPLOAD, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadLessonFile]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_FILE_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_IMAGE_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteLessonVideo(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      const lesson = await UploadService.deleteLessonFile(
        accountId,
        lessonId,
        'videoUrl'
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.FILE_DELETED, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.deleteLessonVideo]:' + e.message);
      if (
        e.message === COURSE_ERRORS.LESSON_MISSING ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === UPLOAD_ERRORS.FILE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteAssessmentVideo(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      const lesson = await UploadService.deleteLessonFile(
        accountId,
        lessonId,
        'assessmentUrl'
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.FILE_DELETED, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.deleteAssessmentVideo]:' + e.message);
      if (
        e.message === COURSE_ERRORS.LESSON_MISSING ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === UPLOAD_ERRORS.FILE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteLessonFile(req, res) {
    const { accountId } = req.user;
    const { lessonId } = req.params;

    try {
      const lesson = await UploadService.deleteLessonFile(
        accountId,
        lessonId,
        'lessonFileUrl'
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.FILE_DELETED, lesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.deleteLessonFile]:' + e.message);
      if (
        e.message === COURSE_ERRORS.LESSON_MISSING ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === UPLOAD_ERRORS.FILE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ================================ MENTORSHIP RELATED UPLOADS ================================

  public static async uploadTaskAttachment(req, res) {
    const { accountId } = req.user;
    const { taskId } = req.params;

    try {
      // if no file attached
      if (!req.files || Object.keys(req.files).length === 0) {
        throw new Error(UPLOAD_ERRORS.NO_FILE_UPLOADED);
      }

      const file = req.files.file;
      const task = await UploadService.uploadTaskAttachment(
        file,
        accountId,
        taskId
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.TASK_ATTACHMENT_UPLOAD, task },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.uploadTaskAttachment]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.TASK_MISSING ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === UPLOAD_ERRORS.NO_FILE_UPLOADED ||
        e.message === UPLOAD_ERRORS.INVALID_ATTACHMENT_TYPE ||
        e.message === UPLOAD_ERRORS.FAILED_ATTACHMENT_SAVE ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async deleteTaskAttachment(req, res) {
    const { accountId } = req.user;
    const { taskId } = req.params;

    try {
      const task = await UploadService.deleteTaskAttachment(
        accountId,
        taskId,
        'attachmentUrl'
      );
      return apiResponse.result(
        res,
        { message: UPLOAD_RESPONSE.ATTACHMENT_DELETED, task },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[uploadController.deleteTaskAttachment]:' + e.message);
      if (
        e.message === MENTORSHIP_ERRORS.TASK_MISSING ||
        e.message === MENTORSHIP_ERRORS.TASK_BUCKET_MISSING ||
        e.message === MENTORSHIP_ERRORS.CONTRACT_MISSING ||
        e.message === MENTORSHIP_ERRORS.LISTING_MISSING ||
        e.message === UPLOAD_ERRORS.ATTACHMENT_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }

      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }
}
