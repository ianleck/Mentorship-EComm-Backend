import express from 'express';
import Utility from '../constants/utility';
import { ChatController } from '../controllers/chat.controller';
import { requireSameUser } from '../middlewares/authenticationMiddleware';
import chat from './schema/chat.schema';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

//Send message to ONE user
router.post(
  '/message/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.accountIdP), //accountId of receiver
  schemaValidator.body(chat.sendMessageB),
  Utility.asyncHandler(ChatController.sendMessage)
);

//Send GROUP message
router.post(
  '/message/chat-group/:chatId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.chatIdP), //accountId of CHAT GROUP
  schemaValidator.body(chat.sendMessageB),
  Utility.asyncHandler(ChatController.sendGroupMessage)
);

//Get WHOLE CHAT LIST of a user
router.get(
  '/list/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser,
  Utility.asyncHandler(ChatController.getChatList)
);

//Create Chat Group
router.post(
  '/chat-group/',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.body(chat.chatGroupB),
  Utility.asyncHandler(ChatController.createChatGroup)
);

//Add user to Chat Group
router.post(
  '/chat-group/:chatId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.userToChatGroupP), //accountId to add to chat group
  Utility.asyncHandler(ChatController.addUserToChatGroup)
);

//Remove user from Chat Group
router.delete(
  '/chat-group/:chatId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.userToChatGroupP), //accountId to remove from chat group
  Utility.asyncHandler(ChatController.removeUserFromChatGroup)
);

//Delete Chat Group
router.delete(
  '/chat-group/:chatId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.chatIdP),
  Utility.asyncHandler(ChatController.deleteChatGroup)
);

export default router;
