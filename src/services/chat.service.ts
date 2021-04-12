import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { FOLLOWING_ENUM, PRIVACY_PERMISSIONS_ENUM } from '../constants/enum';
import { ERRORS, MESSAGE_ERRORS } from '../constants/errors';
import { Chat } from '../models/Chat';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { UserFollowership } from '../models/UserFollowership';
import { UserToChat } from '../models/UserToChat';

export default class ChatService {
  public static async sendMessage(
    accountId: string,
    userId: string,
    message: {
      messageBody: string;
    }
  ): Promise<Message> {
    const receiver = await User.findByPk(accountId);
    if (!receiver) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const sender = await User.findByPk(userId);
    if (!sender) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    //CHECK FOR BLOCKING OF USERS
    await this.blockingCheck(sender, receiver, 'sendMessage');

    //CHECK CHAT PRIVACY AND CONTRACT EXISTENCE BETWEEN THESE TWO USERS
    await this.authorizationCheck(sender, receiver, 'sendMessage');

    //CREATE UNIQUE IDENTIFIER FOR 2 USERS
    let uniqueIdentifier;
    let n = userId.localeCompare(accountId);
    if (n === 1) {
      uniqueIdentifier = accountId.concat(userId);
    } else {
      uniqueIdentifier = userId.concat(accountId);
    }

    //CREATE CHAT IF 2 USERS DO NOT HAVE EXISTING CHAT
    let chat;
    chat = await Chat.findOne({
      where: {
        uniqueIdentifier,
      },
    });
    if (!chat) {
      chat = new Chat({
        accountId1: userId,
        accountId2: accountId,
        uniqueIdentifier,
        isChatGroup: false,
      });

      chat = await chat.save();
    }

    const { messageBody } = message;

    const newMessage = new Message({
      receiverId: accountId,
      senderId: userId,
      messageBody,
      chatId: chat.chatId,
      uniqueIdentifier,
    });

    await newMessage.save();
    chat.changed('updatedAt', true);

    await chat.update({
      updatedAt: new Date(),
    });

    return newMessage;
  }

  public static async sendGroupMessage(
    chatId: string,
    userId: string,
    message: {
      messageBody: string;
    }
  ): Promise<Message> {
    const chatGroup = await Chat.findByPk(chatId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    const sender = await User.findByPk(userId);
    if (!sender) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const { messageBody } = message;

    const newMessage = new Message({
      senderId: userId,
      messageBody,
      chatId,
    });

    await newMessage.save();
    await chatGroup.changed('updatedAt', true);

    await chatGroup.update({
      updatedAt: new Date(),
    });

    return newMessage;
  }

  public static async getChatList(accountId) {
    const chatGroupsUserIsIn = await UserToChat.findAll({
      where: {
        accountId,
      },
    });

    const chatGroupIds = chatGroupsUserIsIn.map((cg) => cg.chatId);

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { chatId: { [Op.in]: chatGroupIds } },
          { [Op.or]: [{ accountId1: accountId }, { accountId2: accountId }] },
        ],
      },
      attributes: [
        'chatId',
        'accountId1',
        'accountId2',
        'nameOfGroup',
        'uniqueIdentifier',
        'isChatGroup',
        'updatedAt',
      ],

      include: [
        {
          model: Message,
          attributes: [
            'messageId',
            'senderId',
            'receiverId',
            'chatId',
            'messageBody',
            'uniqueIdentifier',
            'updatedAt',
          ],
          include: [
            {
              model: User,
              /*as: 'Sender',
              on: {
                '$Sender.accountId$': {
                  [Op.col]: 'Message.senderId',
                },
              },*/
              attributes: ['accountId', 'username', 'firstName', 'lastName'],
            },
            /*{
              model: User,
              as: 'Receiver',
              on: {
                '$Receiver.accountId$': {
                  [Op.col]: 'Message.receiverId',
                },
              },
              attributes: ['accountId', 'username', 'firstName', 'lastName'],
            },*/
          ],
        },
      ],
    });

    // const sortedList = chats.sort((a, b) => b.updatedAt - a.updatedAt);

    const sortByDate = (chats) => {
      const sorter = (a, b) => {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      };
      chats.sort(sorter);
    };
    sortByDate(chats);
    return chats;

    //const sortedChats = chats.sort({'updatedAt':1});
    //const sortedChats = chats.slice().sort((a,b) => b.updatedAt - a.updatedAt);

    //return chats;
  }

  public static async createChatGroup(
    accountId: string,
    chatGroup: {
      name: string;
    }
  ): Promise<Chat> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const { name } = chatGroup;

    const newChat = new Chat({
      accountId1: accountId,
      nameOfGroup: name,
      isChatGroup: true,
    });

    await newChat.save();

    return newChat;
  }

  public static async addUserToChatGroup(userId, accountId, chatId) {
    const ownerOfGroup = await User.findByPk(userId);
    if (!ownerOfGroup) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const userToAdd = await User.findByPk(accountId);
    if (!userToAdd) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await Chat.findByPk(chatId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //CHECK FOR BLOCKING OF USERS
    await this.blockingCheck(ownerOfGroup, userToAdd, 'addToGroup');

    //CHECK IF USER ADDING ACCOUNTID IS OWNER OF GROUP
    if (chatGroup.accountId1 !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    //CHECK CHAT PRIVACY AND CONTRACT EXISTENCE BETWEEN THESE TWO USERS
    await this.authorizationCheck(ownerOfGroup, userToAdd, 'addToGroup');

    const addedUser = new UserToChat({
      chatId,
      accountId,
    });
    await addedUser.save();

    return addedUser;
  }

  //User can remove himself/herself or Owner can remove user from group
  public static async removeUserFromChat(
    userId: string,
    accountId: string,
    chatId
  ) {
    const userReq = await User.findByPk(userId);
    if (!userReq) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const userToRemove = await User.findByPk(accountId);
    if (!userToRemove) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await Chat.findByPk(chatId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //CHECK IF USER REMOVING ACCOUNTID IS OWNER OF GROUP OR SAME USER
    if (
      chatGroup.accountId1 !== userReq.accountId &&
      userReq.accountId !== userToRemove.accountId
    )
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    await UserToChat.destroy({ where: { chatId, accountId } });
  }

  public static async deleteChat(userId: string, chatId) {
    const userReq = await User.findByPk(userId);
    if (!userReq) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await Chat.findByPk(chatId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //CHECK IF USER DELETING GROUP IS OWNER OF GROUP
    if (chatGroup.accountId1 !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    await Chat.destroy({ where: { chatId, accountId: userId } });
  }

  public static async authorizationCheck(sender, receiver, fuctionName) {
    if (
      receiver.chatPrivacy === PRIVACY_PERMISSIONS_ENUM.FOLLOWING_ONLY ||
      receiver.chatPrivacy === PRIVACY_PERMISSIONS_ENUM.NONE
    ) {
      const followership = await UserFollowership.findOne({
        where: {
          followerId: sender.accountId,
          followingId: receiver.accountId,
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (
        followership &&
        receiver.chatPrivacy === PRIVACY_PERMISSIONS_ENUM.FOLLOWING_ONLY
      ) {
        return;
      }
      //Check if there is a course OR mentorship contract between sensei and user
      const existingCourseContract = await CourseContract.findOne({
        where: {
          accountId: receiver.accountId,
        },
      });

      if (existingCourseContract) {
        const course = await Course.findByPk(existingCourseContract.courseId);
        if (course.accountId === sender.accountId) {
          return;
        }
      }

      const existingMentorshipContract = await MentorshipContract.findOne({
        where: {
          accountId: receiver.accountId,
        },
      });
      if (existingMentorshipContract) {
        const mentorshipListing = await MentorshipListing.findByPk(
          existingMentorshipContract.mentorshipListingId
        );
        if (mentorshipListing.accountId === sender.accountId) {
          return;
        }
      }
    } else {
      return;
    }

    if (fuctionName === 'sendMessage') {
      throw new Error(MESSAGE_ERRORS.PRIVATE_USER);
    } else {
      throw new Error(MESSAGE_ERRORS.USER_CANNOT_BE_ADDED);
    }
  }

  public static async blockingCheck(sender, receiver, functionName) {
    //IF THE USER BLOCKED YOU, YOU CANNOT SEND A MESSAGE OR ADD TO GROUP
    const followership = await UserFollowership.findOne({
      where: {
        followerId: sender.accountId,
        followingId: receiver.accountId,
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      },
    });
    if (followership && functionName === 'sendMessage') {
      throw new Error(MESSAGE_ERRORS.PRIVATE_USER);
    } else if (followership && functionName === 'addToGroup') {
      throw new Error(MESSAGE_ERRORS.USER_CANNOT_BE_ADDED);
    }

    //IF YOU BLOCKED USER, YOU CANNOT SEND A MESSAGE OR ADD TO GROUP
    const existingFollowership = await UserFollowership.findOne({
      where: {
        followerId: receiver.accountId,
        followingId: sender.accountId,
        followingStatus: FOLLOWING_ENUM.BLOCKED,
      },
    });
    if (existingFollowership && functionName === 'sendMessage') {
      throw new Error(MESSAGE_ERRORS.PRIVATE_USER);
    } else if (existingFollowership && functionName === 'addToGroup') {
      throw new Error(MESSAGE_ERRORS.USER_CANNOT_BE_ADDED);
    }
  }
}

/*
  public static async getAllMessages(accountId, userId) {
    let identifier;
    let n = userId.localeCompare(accountId); //returns 1 if userId is after accountId, -1 if userId is before
    if (n === 1) {
      identifier = accountId.concat(userId);
    } else {
      identifier = userId.concat(accountId);
    }
    const messages = await Message.findAll({
      where: {
        uniqueIdentifier: identifier,
      },
      include: [
        {
          model: User,
          as: 'Sender',
          on: {
            '$Sender.accountId$': {
              [Op.col]: 'Message.senderId',
            },
          },
          attributes: ['accountId', 'username', 'firstName', 'lastName'],
        },
      ],
    });
    return messages;


    public static async getChatList2(accountId) {
    //Get List of Chat Groups user is in

    const chatGroupsUserIsIn = await UserToChat.findAll({
      where: {
        accountId,
      },
    });

    const chatGroupIds = chatGroupsUserIsIn.map((cg) => cg.chatId);
    const chatGroups = await Chat.findAll({
      where: { chatGroupId: { [Op.in]: chatGroupIds } },
      attributes: ['chatGroupId', 'accountId', 'name'],
      include: [
        {
          model: GroupMessage,
          attributes: ['messageId', 'senderId', 'chatGroupId', 'messageBody'],
          include: [
            {
              model: User,
              attributes: [
                'accountId',
                'firstName',
                'lastName',
                'username',
                'profileImgUrl',
              ],
            },
          ],
        },
      ],
    });
    /* const userMessages = {}; 
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: accountId }, { receiverId: accountId }],
      },
      include: [
        {
          model: User,
          as: 'Sender',
          on: {
            '$Sender.accountId$': {
              [Op.col]: 'Message.senderId',
            },
          },
          attributes: ['accountId', 'username', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'Receiver',
          on: {
            '$Receiver.accountId$': {
              [Op.col]: 'Message.receiverId',
            },
          },
          attributes: ['accountId', 'username', 'firstName', 'lastName'],
        },
      ],
    });
    const userIds = messages.map(msg => {
      const oppUser = msg.senderId !== accountId? msg.senderId : msg.receiverId;
      if(!userMessages[oppUser]) {
        userMessages[oppUser] = []
      }
      userMsgs[oppUser].push(msg)
      return oppUser; 
    })
    //const chatList = [].concat(groupMessages, messages);
    /*const sortedList = chatList.sort((a, b) => b.updatedAt - a.updatedAt);*/

/* const sortByDate = (chatList) => {
      const sorter = (a, b) => {
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      };
      chatList.sort(sorter);
    };
    sortByDate(chatList);
    return chatGroups;
  }
  }*/
