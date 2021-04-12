import joi from 'joi';

export default {
  accountIdP: joi.object({
    accountId: joi.string().required(),
  }),
  sendMessageB: joi.object({
    newMessage: joi.object({
      messageBody: joi.string().required(),
    }),
  }),
  userToChatGroupP: joi.object({
    chatId: joi.string().required(),
    accountId: joi.string().required(),
  }),
  chatGroupB: joi.object({
    newChatGroup: joi.object({
      name: joi.string().required(),
    }),
  }),
  chatIdP: joi.object({
    chatId: joi.string().required(),
  }),
};
