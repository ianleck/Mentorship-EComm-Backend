import httpStatusCodes from 'http-status-codes';
import courseSchema from 'src/routes/schema/course.schema';
import logger from '../config/logger';
import {
  AUTH_ERRORS,
  COURSE_ERRORS,
  ERRORS,
  RESPONSE_ERROR,
} from '../constants/errors';
import { COURSE_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import CourseService from '../services/course.service';
import apiResponse from '../utilities/apiResponse';

export class CourseController {
  // ======================================== COURSE LISTING ========================================
  public static async createCourseDraft(req, res) {
    const { user } = req;
    const { newCourse } = req.body;

    try {
      const createdListing = await CourseService.createCourseDraft(
        user.accountId,
        newCourse
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_CREATE, course: createdListing },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createCourse]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateCourse(req, res) {
    const { user } = req;
    const { courseId } = req.params;
    const { updatedCourse } = req.body;
    try {
      const updatedListing = await CourseService.updateCourse(
        user.accountId,
        courseId,
        updatedCourse
      );

      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_UPDATE, course: updatedListing },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateCourse]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.USER_NOT_VERIFIED ||
        e.message === COURSE_ERRORS.COURSE_NOT_VERIFIED
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

  public static async deleteCourseDraft(req, res) {
    const { user } = req;
    const { courseId } = req.params;
    try {
      await CourseService.deleteCourseDraft(courseId, user.accountId);
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      return Utility.apiErrorResponse(res, e, [
        COURSE_ERRORS.COURSE_DRAFT_MISSING,
        COURSE_ERRORS.DELETE_DISALLOWED,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
      ]);
    }
  }

  // to include search query params in the future (ie: most popular, least popular, page number)
  public static async getAllCourses(req, res) {
    try {
      const courses = await CourseService.getAllCourses();
      return apiResponse.result(
        res,
        {
          message: 'success',
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllCourses]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getAllSenseiCourses(req, res) {
    const { accountId } = req.params;
    const query = req.query;

    try {
      const courses = await CourseService.getAllSenseiCourses(accountId, {
        where: query,
      });
      return apiResponse.result(
        res,
        {
          message: 'success',
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllSenseiCourses]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  /** Get one course
   *  if student => get course without contract
   *  if sensei/admin => get course with contracts
   *  if user is a student and user purchased the course, return existing contract
   * */
  public static async getOneCourse(req, res) {
    const { courseId } = req.params;
    const { user } = req;
    const accountId = user ? user.accountId : null;
    try {
      const course = await CourseService.getOneCourse(courseId, user);
      const existingContract = await CourseService.getContractIfExist(
        courseId,
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          course,
          existingContract,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getOneCourse]:' + e.message);
      if (e.message === COURSE_ERRORS.COURSE_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      }
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  // ======================================== LESSONS ========================================
  public static async createLessonShell(req, res) {
    const { user } = req;
    const { courseId } = req.params;

    try {
      const createdLesson = await CourseService.createLessonShell(
        courseId,
        user.accountId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.LESSON_CREATE, lesson: createdLesson },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createLessonShell]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING
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

  public static async updateLesson(req, res) {
    const { user } = req;
    const { lessonId } = req.params;
    const { updateLesson } = req.body;
    try {
      const updatedLesson = await CourseService.updateLesson(
        lessonId,
        user.accountId,
        updateLesson
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.LESSON_UPDATE, lesson: updatedLesson },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.LESSON_MISSING
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

  public static async deleteLesson(req, res) {
    const { user } = req;
    const { lessonId } = req.params;
    try {
      await CourseService.deleteLesson(lessonId, user.accountId);
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.LESSON_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.deleteLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.LESSON_MISSING
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
  // ======================================== NOTES ================================================
  public static async addNoteToLesson(req, res) {
    const { user } = req;
    const { lessonId } = req.params;
    const { newNote } = req.body;

    try {
      const addedNote = await CourseService.addNoteToLesson(
        lessonId,
        user.accountId,
        newNote
      );
      return apiResponse.result(
        res,
        {
          message: COURSE_RESPONSE.NOTE_CREATE,
          note: addedNote,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.addNoteToLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.LESSON_MISSING
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

  public static async editNoteInLesson(req, res) {
    const { user } = req;
    const { noteId } = req.params;
    const { updateNote } = req.body;
    try {
      const updatedNote = await CourseService.editNoteInLesson(
        noteId,
        user.accountId,
        updateNote
      );
      return apiResponse.result(
        res,
        {
          message: COURSE_RESPONSE.NOTE_UPDATE,
          note: updatedNote,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.editNoteInLesson]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.NOTE_MISSING ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.LESSON_MISSING
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

  public static async getAllNotes(req, res) {
    const { lessonId } = req.params;
    const { user } = req;
    try {
      const notes = await CourseService.getAllNotes(lessonId, user.accountId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          notes,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllNotes]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.LESSON_MISSING
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  // ======================================== ANNOUNCEMENTS ========================================
  public static async createAnnouncement(req, res) {
    const { user } = req;
    const { courseId } = req.params;
    const { newAnnouncement } = req.body;

    try {
      const createdAnnouncement = await CourseService.createAnnouncement(
        courseId,
        user.accountId,
        newAnnouncement
      );
      return apiResponse.result(
        res,
        {
          message: COURSE_RESPONSE.ANNOUNCEMENT_CREATE,
          announcement: createdAnnouncement,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createAnnouncement]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING
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

  public static async updateAnnouncement(req, res) {
    const { user } = req;
    const { announcementId } = req.params;
    const { updateAnnouncement } = req.body;
    try {
      const updatedAnnouncement = await CourseService.updateAnnouncement(
        announcementId,
        user.accountId,
        updateAnnouncement
      );
      return apiResponse.result(
        res,
        {
          message: COURSE_RESPONSE.COURSE_UPDATE,
          announcement: updatedAnnouncement,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.updateAnnouncement]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.ANNOUNCEMENT_MISSING
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

  public static async deleteAnnouncement(req, res) {
    const { user } = req;
    const { announcementId } = req.params;
    try {
      await CourseService.deleteAnnouncement(announcementId, user.accountId);
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.ANNOUNCEMENT_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.deleteAnnouncement]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.ANNOUNCEMENT_MISSING
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

  public static async getAllAnnouncements(req, res) {
    const { courseId } = req.params;
    const { user } = req;
    try {
      const announcements = await CourseService.getAllAnnouncements(
        courseId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          announcements,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllAnnouncements]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async getAnnouncement(req, res) {
    const { announcementId } = req.params;
    const { user } = req;
    try {
      const announcement = await CourseService.getAnnouncement(
        announcementId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          announcement,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAnnouncement]:' + e.message);
      if (
        e.message ===
          httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED) ||
        e.message === COURSE_ERRORS.ANNOUNCEMENT_MISSING ||
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === ERRORS.USER_DOES_NOT_EXIST
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  // ======================================== COURSE REQUESTS ========================================
  public static async getAllRequests(req, res) {
    try {
      const requests = await CourseService.getAllRequests();
      return apiResponse.result(
        res,
        {
          message: 'success',
          requests,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllRequests]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getRequest(req, res) {
    const { courseId } = req.params;
    try {
      const courseRequest = await CourseService.getRequest(courseId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          courseRequest,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getRequest]:' + e.message);
      if (e.message === COURSE_ERRORS.COURSE_MISSING) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async acceptCourseRequest(req, res) {
    const { courseId } = req.params;
    try {
      const courseRequest = await CourseService.acceptCourseRequest(courseId);
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_REQUEST_ACCEPTED, courseRequest },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.acceptCourseRequest]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === ERRORS.SENSEI_DOES_NOT_EXIST ||
        e.message === AUTH_ERRORS.USER_BANNED ||
        e.message === COURSE_ERRORS.USER_NOT_VERIFIED
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async rejectCourseRequest(req, res) {
    const { courseId } = req.params;
    try {
      const courseRequest = await CourseService.rejectCourseRequest(courseId);
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.COURSE_REQUEST_REJECTED, courseRequest },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.rejectCourseRequest]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === ERRORS.SENSEI_DOES_NOT_EXIST ||
        e.message === AUTH_ERRORS.USER_BANNED
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  // ======================================== COURSE CONTRACT ========================================
  public static async createContract(req, res) {
    const { user } = req;

    const { courseId } = req.params;
    try {
      const courseContract = await CourseService.createContract(
        user.accountId,
        courseId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.CONTRACT_CREATE, courseContract },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[courseController.createContract]:' + e.message);
      if (
        e.message === COURSE_ERRORS.COURSE_MISSING ||
        e.message === COURSE_ERRORS.CONTRACT_EXISTS
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

  public static async getAllPurchasedCourses(req, res) {
    const { user } = req;
    const { accountId } = req.params;

    try {
      const courses = await CourseService.getAllPurchasedCourses(
        user.accountId,
        accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          courses,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.getAllPurchasedCourses]:' + e.message);
      if (
        e.message ===
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      ) {
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, {
          message: e.message,
        });
      } else {
        return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
          message: RESPONSE_ERROR.RES_ERROR,
        });
      }
    }
  }

  public static async markLessonCompleted(req, res) {
    const { courseContractId, lessonId } = req.params;
    try {
      const courseContract = await CourseService.markLessonCompleted(
        courseContractId,
        lessonId
      );
      return apiResponse.result(
        res,
        { message: COURSE_RESPONSE.LESSON_COMPLETED, courseContract },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[courseController.markLessonCompleted]:' + e.message);
      Utility.apiErrorResponse(res, e, [
        COURSE_ERRORS.COURSE_MISSING,
        ERRORS.SENSEI_DOES_NOT_EXIST,
        AUTH_ERRORS.USER_BANNED,
      ]);
    }
  }
}
