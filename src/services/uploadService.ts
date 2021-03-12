import { Op } from 'sequelize';
import {
  ALLOWED_DOCUMENT_FILE_TYPES,
  ALLOWED_IMG_FILE_TYPES,
  BACKEND_API,
} from '../constants/constants';
import { ERRORS, RESPONSE_ERROR, UPLOAD_ERRORS } from '../constants/errors';
import {
  ADMIN_VERIFIED_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { Admin } from '../models/Admin';
import { Experience } from '../models/Experience';
import { User } from '../models/User';
import Utility from '../constants/utility';
import { reject } from 'bluebird';
export default class UploadService {
  // ================================ UPLOAD HELPER METHODS ================================
  /**
   * Returns the relative file path from src/ folder of
   * 1. Where the file will be stored
   * 2. URL for frontend to retrieve file
   * @param type: Type of file that is saved. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getFilePath(type: string, name: string, fileType: string) {
    return `${type}/${name}${fileType}`;
  }

  /**
   * Returns the download URL where frontend can access the file, to be stored as the value of an attribute in the relevant table.
   * Eg. http://<BACKEND_API>/api/file/cv/<userId>.docx or http://<BACKEND_API>/api/file/transcript/<userId>.doc
   * @param type: Type of file that is saved. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getSaveName(type: string, name: string, fileType: string) {
    const filePath = this.getFilePath(type, name, fileType);
    return `${BACKEND_API}/file/${filePath}`;
  }

  /**
   * Returns the save file path that determines where to store the file in backend proj
   * @param type: Type of file that is saved. Eg. CV, transcript, profileImg, courseImg, video etc. src/uploads/ should have the folder
   * @param name: name of file to be saved as. Eg. <userId>.docx or <courseId>.png
   * @param fileType: file type. Eg. docx, doc, png, jpeg etc
   */
  private static getSaveFilePath(type: string, name: string, fileType: string) {
    const filePath = this.getFilePath(type, name, fileType);
    return `${__dirname}/../../uploads/${filePath}`;
  }

  // ================================ USER RELATED UPLOADS ================================

  public static async uploadCv(file, accountId: string): Promise<void> {
    const fileType = Utility.getFileType(file.name);
    const type = 'cv';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(type, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(type, accountId, fileType);
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_CV_SAVE));
        } else {
          let user: any = await User.findByPk(accountId);
          if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
          user = await user.update({ cvUrl: saveName });
          resolve(user);
        }
      });
    });
  }

  public static async uploadTranscript(file, accountId: string): Promise<void> {
    const fileType = Utility.getFileType(file.name);
    const type = 'transcript';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_DOCUMENT_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(type, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(type, accountId, fileType);
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_TRANSCRIPT_SAVE));
        } else {
          let user: any = await User.findByPk(accountId);
          if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
          user = await user.update({ transcriptUrl: saveName });
          resolve(user);
        }
      });
    });
  }

  public static async uploadProfilePic(file, accountId: string): Promise<void> {
    const fileType = Utility.getFileType(file.name);
    const type = 'dp';
    // if fileType is not .docx / .pdf / . doc, return error;
    if (ALLOWED_IMG_FILE_TYPES.indexOf(fileType) == -1) {
      throw new Error(UPLOAD_ERRORS.INVALID_FILE_TYPE);
    }

    const saveName = this.getSaveName(type, accountId, fileType);
    const saveFilePath = this.getSaveFilePath(type, accountId, fileType);
    return new Promise((resolve, reject) => {
      return file.mv(saveFilePath, async (err) => {
        if (err) {
          reject(new Error(UPLOAD_ERRORS.FAILED_IMAGE_SAVE));
        } else {
          let user: any = await User.findByPk(accountId);
          if (!user) reject(new Error(ERRORS.USER_DOES_NOT_EXIST));
          user = await user.update({ profileImgUrl: saveName });
          resolve(user);
        }
      });
    });
  }
}
