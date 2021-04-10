import express from 'express';
import Utility from '../constants/utility';
import { ChatController } from '../controllers/chat.controller';
import { requireSameUser } from '../middlewares/authenticationMiddleware';
import chat from './schema/chat.schema';

const passport = require('passport');

const router = express.Router();

const schemaValidator = require('express-joi-validation').createValidator({});

//Send ONE message
router.post(
  '/message/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.accountIdP), //accountId of receiver
  schemaValidator.body(chat.sendMessageB),
  Utility.asyncHandler(ChatController.sendMessage)
);

//Send GROUP message
router.post(
  '/message/chat-group/:chatGroupId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.chatGroupIdP), //accountId of receiver
  schemaValidator.body(chat.sendMessageB),
  Utility.asyncHandler(ChatController.sendGroupMessage)
);

//Get all messages between TWO users
router.get(
  '/all/messages/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.accountIdP),
  Utility.asyncHandler(ChatController.getAllMessages)
);

//Get WHOLE CHAT LIST of a user
router.get(
  '/all/chat-list/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser,
  Utility.asyncHandler(ChatController.getChatList)
);

//Create Chat Group
router.post(
  '/chat-group/new/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  requireSameUser,
  schemaValidator.params(chat.accountIdP), //creator of chat group
  schemaValidator.body(chat.chatGroupB),
  Utility.asyncHandler(ChatController.createChatGroup)
);

//Add user to Chat Group
router.post(
  '/chat-group/:chatGroupId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.userToChatGroupP), //accountId to add to chat group
  Utility.asyncHandler(ChatController.addUserToChatGroup)
);

//Remove user from Chat Group
router.delete(
  '/chat-group/:chatGroupId/:accountId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.userToChatGroupP), //accountId to add to chat group
  Utility.asyncHandler(ChatController.removeUserFromChatGroup)
);

//Delete Chat Group
router.delete(
  '/chat-group/:chatGroupId',
  passport.authenticate('isAuthenticated', { session: false }),
  schemaValidator.params(chat.chatGroupIdP),
  Utility.asyncHandler(ChatController.deleteChatGroup)
);

export default router;
