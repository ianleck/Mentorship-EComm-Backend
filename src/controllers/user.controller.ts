import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import {
  ERRORS,
  MESSAGE_ERRORS,
  RESPONSE_ERROR,
  SOCIAL_ERRORS,
} from '../constants/errors';
import { MESSAGE_RESPONSE, USER_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import UserService from '../services/user.service';
import apiResponse from '../utilities/apiResponse';

export class UserController {
  // ================================ USER ================================

  public static async deactivateUser(req, res) {
    const { accountId } = req.params;

    try {
      await UserService.deactivateUser(accountId);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.USER_DEACTIVATE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deactivateUser]:' + e.message);
      if (e.message === ERRORS.STUDENT_DOES_NOT_EXIST) {
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

  public static async getUserProfile(req, res) {
    const { accountId } = req.params;
    const { user } = req;
    try {
      const { userProfile, isBlocking } = await UserService.findUserById(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          userProfile,
          isBlocking,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getUserProfile]:' + e.message);
      if (
        e.message === ERRORS.USER_DOES_NOT_EXIST ||
        e.message === SOCIAL_ERRORS.PRIVATE_USER
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

  public static async getAllActiveStudents(req, res) {
    try {
      const students = await UserService.getAllActiveStudents();
      return apiResponse.result(
        res,
        {
          message: 'success',
          students,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getAllActiveStudents]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getAllActiveSenseis(req, res) {
    try {
      const senseis = await UserService.getAllActiveSenseis();
      return apiResponse.result(
        res,
        {
          message: 'success',
          senseis,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getAllActiveSenseis]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async updateUser(req, res) {
    const { accountId } = req.params;
    const { user } = req.body;

    try {
      const userEntity = await UserService.updateUser(accountId, user);
      apiResponse.result(
        res,
        { message: USER_RESPONSE.USER_UPDATE, user: userEntity },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateUser]' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
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

  // ================================ USER EXPERIENCE ================================

  public static async createExperience(req, res) {
    const { accountId } = req.params;
    const { experience } = req.body;

    try {
      const exp = await UserService.createExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_CREATE, experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.createExperience]:' + e.message);
      if (e.message === ERRORS.USER_DOES_NOT_EXIST) {
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

  public static async deleteExperience(req, res) {
    const { experienceId } = req.params;

    try {
      await UserService.deleteExperience(experienceId);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_DELETE },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deleteExperience]:' + e.message);
      if (e.message === ERRORS.EXPERIENCE_DOES_NOT_EXIST) {
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

  public static async updateExperience(req, res) {
    const { accountId } = req.params;
    const { experience } = req.body;

    try {
      const exp = await UserService.updateExperience(accountId, experience);
      return apiResponse.result(
        res,
        { message: USER_RESPONSE.EXPERIENCE_UPDATE, experience: exp },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.updateExperience]:' + e.message);
      if (
        e.message === ERRORS.EXPERIENCE_DOES_NOT_EXIST ||
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

  //===================================== MESSAGE ====================================

  public static async sendMessage(req, res) {
    const { accountId } = req.params; //receiverId
    const { user } = req; //sender
    const { newMessage } = req.body;

    try {
      const sentMessage = await UserService.sendMessage(
        accountId,
        user.accountId,
        newMessage
      );
      return apiResponse.result(
        res,
        {
          message: MESSAGE_RESPONSE.MESSAGE_CREATE,
          sentMessage,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[userController.sendMessage]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        MESSAGE_ERRORS.PRIVATE_USER,
      ]);
    }
  }

  public static async sendGroupMessage(req, res) {
    const { chatGroupId } = req.params; //chat group Id
    const { user } = req; //sender
    const { newMessage } = req.body;

    try {
      const sentMessage = await UserService.sendGroupMessage(
        chatGroupId,
        user.accountId,
        newMessage
      );
      return apiResponse.result(
        res,
        {
          message: MESSAGE_RESPONSE.MESSAGE_CREATE,
          sentMessage,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[userController.sendGroupMessage]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }

  public static async getAllMessages(req, res) {
    const { accountId } = req.params;
    const { user } = req;
    try {
      const listOfMessages = await UserService.getAllMessages(
        accountId,
        user.accountId
      );
      return apiResponse.result(
        res,
        {
          message: 'success',
          listOfMessages,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getAllMessages]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async getChatList(req, res) {
    const { accountId } = req.params;

    try {
      const chatList = await UserService.getChatList(accountId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          chatList,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.getChatList]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async createChatGroup(req, res) {
    const { user } = req; //creator of chat group
    const { newChatGroup } = req.body;

    try {
      const groupCreated = await UserService.createChatGroup(
        user.accountId,
        newChatGroup
      );
      return apiResponse.result(
        res,
        {
          message: MESSAGE_RESPONSE.GROUP_CREATE,
          groupCreated,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[userController.createChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [ERRORS.USER_DOES_NOT_EXIST]);
    }
  }
  public static async addUserToChatGroup(req, res) {
    const { user } = req;
    const { chatGroupId, accountId } = req.params;

    try {
      const userAdded = await UserService.addUserToChatGroup(
        user.accountId,
        accountId,
        chatGroupId
      );
      return apiResponse.result(
        res,
        {
          message: MESSAGE_RESPONSE.USER_ADDED,
          userAdded,
        },
        httpStatusCodes.CREATED
      );
    } catch (e) {
      logger.error('[userController.addUserToChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MESSAGE_ERRORS.USER_CANNOT_BE_ADDED,
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }

  public static async removeUserFromChatGroup(req, res) {
    const { user } = req;
    const { chatGroupId, accountId } = req.params;

    try {
      await UserService.removeUserFromChatGroup(
        user.accountId,
        accountId,
        chatGroupId
      );
      return apiResponse.result(
        res,
        { message: MESSAGE_RESPONSE.USER_REMOVED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.removeUserFromChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }

  public static async deleteChatGroup(req, res) {
    const { user } = req;
    const { chatGroupId } = req.params;

    try {
      await UserService.deleteChatGroup(user.accountId, chatGroupId);
      return apiResponse.result(
        res,
        { message: MESSAGE_RESPONSE.GROUP_DELETED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[userController.deleteChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }
}
