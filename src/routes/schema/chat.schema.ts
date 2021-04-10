import joi from 'joi';

export default {
  accountIdP: joi.object({
    accountId: joi.string().required(),
  }),
  sendMessageB: joi.object({
    newMessage: joi.object({
      description: joi.string().required(),
    }),
  }),
  userToChatGroupP: joi.object({
    chatGroupId: joi.string().required(),
    accountId: joi.string().required(),
  }),
  chatGroupB: joi.object({
    newChatGroup: joi.object({
      name: joi.string().required(),
    }),
  }),
  chatGroupIdP: joi.object({
    chatGroupId: joi.string().required(),
  }),
};
