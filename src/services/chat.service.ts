import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import { FOLLOWING_ENUM, PRIVACY_PERMISSIONS_ENUM } from '../constants/enum';
import { ERRORS, MESSAGE_ERRORS } from '../constants/errors';
import { ChatGroup } from '../models/ChatGroup';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { UserFollowership } from '../models/UserFollowership';
import { UserToChatGroup } from '../models/UserToChatGroup';

export default class ChatService {
  public static async sendMessage(
    accountId: string,
    userId: string,
    message: {
      description: string;
    }
  ): Promise<Message> {
    const receiver = await User.findByPk(accountId);
    if (!receiver) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const sender = await User.findByPk(userId);
    if (!sender) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    var authorized = await this.authorizationCheck(sender, receiver);

    if (authorized === true) {
      var uniqueIdentifier;

      var n = userId.localeCompare(accountId); //returns 1 if userId is after accountId, -1 if userId is before
      if (n === 1) {
        uniqueIdentifier = accountId.concat(userId);
      } else {
        uniqueIdentifier = userId.concat(accountId);
      }

      const { description } = message;

      const newMessage = new Message({
        receiverId: accountId,
        senderId: userId,
        description,
        uniqueIdentifier,
      });

      await newMessage.save();

      return newMessage;
    } else {
      throw new Error(MESSAGE_ERRORS.PRIVATE_USER);
    }
  }

  public static async sendGroupMessage(
    chatGroupId: string,
    userId: string, //user sending the message
    message: {
      description: string;
    }
  ): Promise<Message> {
    const chatGroup = await ChatGroup.findByPk(chatGroupId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    const sender = await User.findByPk(userId);
    if (!sender) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const { description } = message;

    const newMessage = new Message({
      senderId: userId,
      description,
      chatGroupId,
    });

    await newMessage.save();

    return newMessage;
  }

  public static async getAllMessages(accountId, userId) {
    var identifier;
    var n = userId.localeCompare(accountId); //returns 1 if userId is after accountId, -1 if userId is before
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
  }

  public static async getChatList(accountId) {
    //Get List of Chat Groups this user is in
    const chatGroups = await UserToChatGroup.findAll({
      where: {
        accountId,
      },
    });
    const chatGroupIds = chatGroups.map((cg) => cg.chatGroupId);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: accountId },
          { receiverId: accountId },
          { chatGroupId: { [Op.in]: [...chatGroupIds] } },
        ],
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
          model: ChatGroup,
          attributes: ['chatGroupId', 'name'],
        },
      ],
    });
    return messages;
  }

  public static async createChatGroup(
    accountId: string,
    chatGroup: {
      name: string;
    }
  ): Promise<ChatGroup> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const { name } = chatGroup;

    const newChatGroup = new ChatGroup({
      accountId,
      name,
    });

    await newChatGroup.save();

    return newChatGroup;
  }

  public static async addUserToChatGroup(
    userId: string, //owner of the group
    accountId: string,
    chatGroupId
  ) {
    const ownerOfGroup = await User.findByPk(userId);
    if (!ownerOfGroup) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const userToAdd = await User.findByPk(accountId);
    if (!userToAdd) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await ChatGroup.findByPk(chatGroupId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //Check if user adding accountId is creator of the group
    if (chatGroup.accountId !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    //Check Chat Privacy of user to add to chat group:
    /* If CHAT_PRIVACY_NONE or CHAT_PRIVACY_FOLLOWING_ONLY, check if the owner adding accountId user 
       is a sensei and if he/she has a contract with accountId user  
    */

    var authorized = await this.authorizationCheck(ownerOfGroup, userToAdd);

    if (authorized === true) {
      const addedUser = new UserToChatGroup({
        chatGroupId,
        accountId,
      });
      await addedUser.save();

      return addedUser;
    } else {
      throw new Error(MESSAGE_ERRORS.USER_CANNOT_BE_ADDED);
    }
  }

  public static async removeUserFromChatGroup(
    userId: string, //owner of the group
    accountId: string,
    chatGroupId
  ) {
    const ownerOfGroup = await User.findByPk(userId);
    if (!ownerOfGroup) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const userToRemove = await User.findByPk(accountId);
    if (!userToRemove) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await ChatGroup.findByPk(chatGroupId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //Check if user removing accountId is creator of the group
    if (chatGroup.accountId !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    await UserToChatGroup.destroy({ where: { chatGroupId, accountId } });
  }

  public static async deleteChatGroup(userId: string, chatGroupId) {
    const userReq = await User.findByPk(userId);
    if (!userReq) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const chatGroup = await ChatGroup.findByPk(chatGroupId);
    if (!chatGroup) throw new Error(MESSAGE_ERRORS.CHAT_GROUP_MISSING);

    //Check if user deleting group is creator of the group
    if (chatGroup.accountId !== userId)
      throw new Error(
        httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED)
      );

    await ChatGroup.destroy({ where: { chatGroupId, accountId: userId } });
  }

  public static async authorizationCheck(sender, receiver) {
    var authorized = false;
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
        authorized = true;
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
          authorized = true;
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
          authorized = true;
        }
      }
    } else {
      authorized = true;
    }

    return authorized;
  }
}
