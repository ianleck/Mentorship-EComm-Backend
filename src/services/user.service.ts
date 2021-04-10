import httpStatusCodes from 'http-status-codes';
import { Op } from 'sequelize';
import {
  ADMIN_VERIFIED_ENUM,
  FOLLOWING_ENUM,
  MENTORSHIP_CONTRACT_APPROVAL,
  PRIVACY_PERMISSIONS_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { ERRORS, MESSAGE_ERRORS } from '../constants/errors';
import { Admin } from '../models/Admin';
import { ChatGroup } from '../models/ChatGroup';
import { Course } from '../models/Course';
import { CourseContract } from '../models/CourseContract';
import { Experience } from '../models/Experience';
import { MentorshipContract } from '../models/MentorshipContract';
import { MentorshipListing } from '../models/MentorshipListing';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { UserFollowership } from '../models/UserFollowership';
import { UserToChatGroup } from '../models/UserToChatGroup';

export default class UserService {
  // ================================ USER ================================

  public static async deactivateUser(accountId: string): Promise<void> {
    try {
      await User.destroy({
        where: {
          accountId,
        },
      });
      return;
    } catch (e) {
      throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);
    }
  }

  public static async findUserById(accountId: string, userId: string) {
    var isBlocking = false;
    const userProfile = await User.findByPk(accountId, {
      include: [Experience],
    });
    if (!userProfile) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    // CHECK IF ADMIN
    const userReq = await User.findByPk(userId);
    if (!userReq) {
      return { userProfile, isBlocking };
    }

    //CHECK IF BLOCKED BY ACCOUNTID USER (user logged in is the followerId)
    if (userReq.accountId !== accountId) {
      const followership = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: accountId,
          followingStatus: FOLLOWING_ENUM.BLOCKED,
        },
      });
      //return user who blocked
      if (followership) {
        const userProfile = await User.findByPk(accountId, {
          attributes: ['accountId'],
        });
        return { userProfile, isBlocking: true };
      }
    }

    //CHECK IF USER LOGGED IN HAS BLOCKED ACCOUNTID
    if (userReq.accountId !== accountId) {
      const followership = await UserFollowership.findOne({
        where: {
          followerId: accountId,
          followingId: userId,
          followingStatus: FOLLOWING_ENUM.BLOCKED,
        },
      });
      //return user who blocked
      if (followership) {
        const userProfile = await User.findByPk(userId, {
          attributes: ['accountId'],
        });
        return { userProfile, isBlocking: true };
      }
    }

    //CHECK IF ACCOUNTID USER IS PRIVATE
    if (
      userReq.accountId !== accountId &&
      userProfile.isPrivateProfile === true
    ) {
      //try to find a followership
      const followership = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: accountId,
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (!followership) {
        const userProfile = await User.findByPk(accountId, {
          attributes: [
            'accountId',
            'username',
            'firstName',
            'lastName',
            'profileImgUrl',
            'isPrivateProfile',
          ],
        });
        return { userProfile, isBlocking };
      }
    }

    return { userProfile, isBlocking };
  }

  public static async findUserOrAdminById(
    accountId: string,
    userType: USER_TYPE_ENUM
  ): Promise<User | Admin> {
    try {
      if (
        userType == USER_TYPE_ENUM.STUDENT ||
        userType == USER_TYPE_ENUM.SENSEI
      ) {
        return User.findByPk(accountId);
      } else if (userType == USER_TYPE_ENUM.ADMIN) {
        return Admin.findByPk(accountId);
      } else {
        throw new Error(ERRORS.USER_DOES_NOT_EXIST);
      }
    } catch (e) {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  public static async getUsersByFilter(filter: {
    username?: string;
    firstName?: string;
    email?: string;
    contactNumber?: string;
    emailVerified?: boolean;
    status?: STATUS_ENUM;
    userType?: USER_TYPE_ENUM;
    adminVerified?: ADMIN_VERIFIED_ENUM;
  }) {
    // exact: emailVerified, userType, adminVerified
    // like: username, firstname, contactNumber, email,
    const likeKeys = ['username', 'firstName', 'contactNumber', 'email'];
    let where = {};
    Object.keys(filter).forEach((key) => {
      if (likeKeys.indexOf(key) != -1) {
        where[key] = {
          [Op.like]: `%${filter[key]}%`,
        };
      } else {
        where[key] = filter[key];
      }
    });
    return await User.findAll({
      where,
    });
  }
  // get all users with userType = STUDENT
  public static async getAllActiveStudents() {
    const students = User.findAll({
      where: {
        status: { [Op.eq]: STATUS_ENUM.ACTIVE },
        userType: USER_TYPE_ENUM.STUDENT,
      },
    });
    return students;
  }

  // get all users with userType = SENSEI
  public static async getAllActiveSenseis() {
    const senseis = User.findAll({
      where: {
        status: { [Op.eq]: STATUS_ENUM.ACTIVE },
        userType: USER_TYPE_ENUM.SENSEI,
      },
    });
    return senseis;
  }

  public static async toggleUserStatus(accountId: string): Promise<User> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    let newStatus = STATUS_ENUM.ACTIVE;
    if (user.status === STATUS_ENUM.ACTIVE) {
      newStatus = STATUS_ENUM.BANNED;
    }
    return user.update({
      status: newStatus,
    });
  }

  public static async updateUser(
    accountId: string,
    fields: { [key: string]: string }
  ) {
    const user = await User.findByPk(accountId);
    if (user) {
      await user.update(fields);
      return await User.findByPk(accountId);
    } else {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  // ================================ USER EXPERIENCE ================================
  public static async createExperience(
    accountId: string,
    experience: {
      role: string;
      dateStart: Date;
      dateEnd: Date;
      description: string;
    }
  ): Promise<Experience> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    try {
      const newExp = new Experience({
        ...experience,
        accountId: user.accountId,
      });
      await newExp.save();
      return newExp;
    } catch (e) {
      throw e;
    }
  }

  public static async deleteExperience(experienceId: string): Promise<void> {
    try {
      await Experience.destroy({
        where: {
          experienceId,
        },
      });
      return;
    } catch (e) {
      throw new Error(ERRORS.EXPERIENCE_DOES_NOT_EXIST);
    }
  }

  // update one user experience by experienceId
  public static async updateExperience(
    accountId: string,
    experience: {
      experienceId: string;
      role: string;
      dateStart: Date;
      dateEnd: Date;
      description: string;
    }
  ): Promise<Experience> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    try {
      const exp = await Experience.findByPk(experience.experienceId);
      if (!exp) throw new Error(ERRORS.EXPERIENCE_DOES_NOT_EXIST);
      await exp.update({
        ...experience,
      });
      await exp.save();
      return exp;
    } catch (e) {
      throw e;
    }
  }

  public static async getExperienceByAccountId(accountId: string) {
    const user = await User.findByPk(accountId, {
      include: [Experience],
    });
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    return user.Experience;
  }

  //===================================== MESSAGE ====================================

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
          senseiApproval: MENTORSHIP_CONTRACT_APPROVAL.APPROVED,
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
