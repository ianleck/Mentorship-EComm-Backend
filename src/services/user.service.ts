import { User } from '../models/User';
import { STATUS_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import { Admin } from '../models/Admin';
import { ERRORS } from '../constants/errors';
import { Op } from 'sequelize';
import { Experience } from '../models/Experience';
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

  public static async findUserById(accountId: string): Promise<User> {
    const user = await User.findByPk(accountId, {
      include: [Experience],
    });
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
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
      newExp.save();
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
      exp.save();
      return exp;
    } catch (e) {
      throw e;
    }
  }
}
