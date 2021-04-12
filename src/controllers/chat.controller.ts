import httpStatusCodes from 'http-status-codes';
import logger from '../config/logger';
import { ERRORS, MESSAGE_ERRORS, RESPONSE_ERROR } from '../constants/errors';
import { MESSAGE_RESPONSE } from '../constants/successMessages';
import Utility from '../constants/utility';
import ChatService from '../services/chat.service';
import apiResponse from '../utilities/apiResponse';

export class ChatController {
  public static async sendMessage(req, res) {
    const { accountId } = req.params; //receiverId
    const { user } = req; //sender
    const { newMessage } = req.body;

    try {
      const sentMessage = await ChatService.sendMessage(
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
      logger.error('[chatController.sendMessage]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        MESSAGE_ERRORS.PRIVATE_USER,
      ]);
    }
  }

  public static async sendGroupMessage(req, res) {
    const { chatId } = req.params; //chat group Id
    const { user } = req; //sender
    const { newMessage } = req.body;

    try {
      const sentMessage = await ChatService.sendGroupMessage(
        chatId,
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
      logger.error('[chatController.sendGroupMessage]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }

  public static async getChatList(req, res) {
    const { accountId } = req.params;

    try {
      const chatList = await ChatService.getChatList(accountId);
      return apiResponse.result(
        res,
        {
          message: 'success',
          chatList,
        },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[chatController.getChatList]:' + e.message);
      return apiResponse.error(res, httpStatusCodes.INTERNAL_SERVER_ERROR, {
        message: RESPONSE_ERROR.RES_ERROR,
      });
    }
  }

  public static async createChatGroup(req, res) {
    const { user } = req; //creator of chat group
    const { newChatGroup } = req.body;

    try {
      const groupCreated = await ChatService.createChatGroup(
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
      logger.error('[chatController.createChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [ERRORS.USER_DOES_NOT_EXIST]);
    }
  }
  public static async addUserToChatGroup(req, res) {
    const { user } = req;
    const { chatId, accountId } = req.params;

    try {
      const userAdded = await ChatService.addUserToChatGroup(
        user.accountId,
        accountId,
        chatId
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
      logger.error('[chatController.addUserToChatGroup]:' + e.message);
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
      await ChatService.removeUserFromChat(
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
      logger.error('[chatController.removeUserFromChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }

  public static async deleteChatGroup(req, res) {
    const { user } = req;
    const { chatId } = req.params;

    try {
      await ChatService.deleteChat(user.accountId, chatId);
      return apiResponse.result(
        res,
        { message: MESSAGE_RESPONSE.GROUP_DELETED },
        httpStatusCodes.OK
      );
    } catch (e) {
      logger.error('[chatController.deleteChatGroup]:' + e.message);
      return Utility.apiErrorResponse(res, e, [
        ERRORS.USER_DOES_NOT_EXIST,
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED),
        MESSAGE_ERRORS.CHAT_GROUP_MISSING,
      ]);
    }
  }
}
