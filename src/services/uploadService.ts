import { reject } from 'bluebird';
import httpStatusCodes from 'http-status-codes';
import { Lesson } from '../models/Lesson';
import {
  ALLOWED_DOCUMENT_FILE_TYPES,
  ALLOWED_IMG_FILE_TYPES,
  ALLOWED_VIDEO_FILE_TYPES,
  BACKEND_API,
  ALLOWED_ZIP_FILE,
} from '../constants/constants';
import { COURSE_ERRORS, ERRORS, UPLOAD_ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import { Course } from '../models/Course';
import { User } from '../models/User';

const fs = require('fs');
export default class UploadService {
  // ================================ UPLOAD HELPER METHODS ================================
  /**
   * Returns the relative file path from src/ folder of
   * 1. Where the file will be stored
   * 2. URL for frontend to retrieve file
   * @param folder: Folder of file that is saved to. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getFilePath(folder: string, name: string, fileType: string) {
    return `${folder}/${name}${fileType}`;
  }

  /**
   * Returns the download URL where frontend can access the file, to be stored as the value of an attribute in the relevant table.
   * Eg. http://<BACKEND_API>/api/file/cv/<userId>.docx or http://<BACKEND_API>/api/file/transcript/<userId>.doc
   * @param folder: Folder of file that is saved to. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getSaveName(folder: string, name: string, fileType: string) {
    const filePath = this.getFilePath(folder, name, fileType);
    return `${BACKEND_API}/file/${filePath}`;
  }

  /**
   * Returns the save file path that determines where to store the file in backend proj
   * @param folder: Folder of file that is saved to. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getSaveFilePath(
    folder: string,
    name: string,
    fileType: string
  ) {
    const filePath = this.getFilePath(folder, name, fileType);
    return `${__dirname}/../../uploads/${filePath}`;
  }

  // ================================ USER RELATED UPLOADS ================================

  public static async uploadCv(file, accountId: string): Promise<User> {
    const fileType = Utility.getFileType(file.name);
    const folder = 'cv';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(folder, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, accountId, fileType);

    let user: any = await User.findByPk(accountId);
    if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
    if (user.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_CV_SAVE));
        } else {
          user = await user.update({ cvUrl: saveName });
          resolve(user);
        }
      });
    });
  }

  public static async uploadTranscript(file, accountId: string): Promise<User> {
    const fileType = Utility.getFileType(file.name);
    const folder = 'transcript';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(folder, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, accountId, fileType);

    let user: any = await User.findByPk(accountId);
    if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
    if (user.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_TRANSCRIPT_SAVE));
        } else {
          user = await user.update({ transcriptUrl: saveName });
          resolve(user);
        }
      });
    });
  }

  public static async uploadProfilePic(file, accountId: string): Promise<User> {
    const fileType = Utility.getFileType(file.name);
    const folder = 'dp';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_IMG_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(folder, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, accountId, fileType);

    let user: any = await User.findByPk(accountId);
    if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
    if (user.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_IMAGE_SAVE));
        } else {
          user = await user.update({ profileImgUrl: saveName });
          resolve(user);
        }
      });
    });
  }

  // ================================ COURSE RELATED UPLOADS ================================
  public static async uploadCoursePic(
    file,
    accountId: string,
    courseId: string
  ): Promise<Course> {
    const fileType = Utility.getFileType(file.name);
    const folder = 'course/image';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_IMG_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(folder, courseId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, courseId, fileType);
    let course: any = await Course.findByPk(courseId);
    if (!course) reject(new Error(COURSE_ERRORS.COURSE_MISSING));
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_IMAGE_SAVE));
        } else {
          course = await course.update({ imgUrl: saveName });
          resolve(course);
        }
      });
    });
  }

  public static async uploadLessonFile(
    file,
    accountId: string,
    lessonId: string
  ): Promise<Lesson> {
    const fileType = Utility.getFileType(file.name);
    const folder = 'course/lesson/file';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_ZIP_FILE.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.ZIP_FILE_ALLOWED);
    }

    const saveName = this.getSaveName(folder, lessonId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, lessonId, fileType);
    let lesson: any = await Lesson.findByPk(lessonId);
    if (!lesson) reject(new Error(COURSE_ERRORS.LESSON_MISSING));

    const course = await Course.findByPk(lesson.courseId);
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_IMAGE_SAVE));
        } else {
          lesson = await lesson.update({ lessonFileUrl: saveName });
          resolve(lesson);
        }
      });
    });
  }

  public static async uploadLessonVideo(
    file,
    accountId: string,
    lessonId: string,
    folder: string, // relative path of the folder where the video is stored at
    lessonAttribute: string // eg. lesson.videoUrl or lesson.assessmentUrl
  ): Promise<Course> {
    const fileType = Utility.getFileType(file.name);
    // if fileType is not an allowed type, return error;
    if (ALLOWED_VIDEO_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(folder, lessonId, fileType);
    const saveFilePath = this.getSaveFilePath(folder, lessonId, fileType);
    let lesson: any = await Lesson.findByPk(lessonId, {
      include: [Course],
    });
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    const course = lesson.Course;
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    // delete file if exist
    if (lesson[lessonAttribute] !== null) {
      await this.deleteLessonFile(accountId, lessonId, lessonAttribute);
    }
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_IMAGE_SAVE));
        } else {
          lesson = await lesson.update({ [lessonAttribute]: saveName });
          resolve(lesson);
        }
      });
    });
  }

  public static async deleteLessonFile(
    accountId: string,
    lessonId: string,
    lessonAttribute: string
  ) {
    // check if lesson and video exist
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) throw new Error(COURSE_ERRORS.LESSON_MISSING);

    // check if course exist
    const course = await Course.findByPk(lesson.courseId);
    if (!course) throw new Error(COURSE_ERRORS.COURSE_MISSING);

    // check if user is authorized
    if (course.accountId !== accountId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    const url = lesson[lessonAttribute];
    if (!url) throw new Error(UPLOAD_ERRORS.FILE_MISSING);
    const relativePath = url.substring(url.indexOf('file') + 5); // +5 to get string after 'file/<path we want>'
    const path = `${__dirname}/../../uploads/${relativePath}`; // file path to delete

    return new Promise<Lesson>((res, rej) => {
      fs.unlink(path, async (err) => {
        if (err) {
          rej(err);
        } else {
          const _lesson = await lesson.update({
            [lessonAttribute]: null,
          });
          res(_lesson);
        }
      });
    });
  }
}
