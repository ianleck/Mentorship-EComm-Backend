import { Op } from 'sequelize';
import {
  ADMIN_VERIFIED_ENUM,
  FOLLOWING_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { ERRORS, SOCIAL_ERRORS } from '../constants/errors';
import { Admin } from '../models/Admin';
import { Experience } from '../models/Experience';
import { User } from '../models/User';
import { UserFollowership } from '../models/UserFollowership';

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

  public static async findUserById(
    accountId: string,
    userId: string
  ): Promise<User> {
    const user = await User.findByPk(accountId, {
      include: [Experience],
    });
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    const userReq = await User.findByPk(userId);
    //Admin
    if (!userReq) {
      return user;
    }

    //if user's account is private AND not following and requestor is NOT Admin/own account, return error
    if (userReq.accountId !== accountId && user.isPrivateProfile === true) {
      //try to find a followership
      const followership = await UserFollowership.findOne({
        where: {
          followerId: userId,
          followingId: accountId,
          followingStatus: FOLLOWING_ENUM.APPROVED,
        },
      });
      if (!followership) throw new Error(SOCIAL_ERRORS.PRIVATE_USER);
    }

    return user;
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
}
