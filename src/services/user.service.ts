import { User } from '../models/User';
import bcrypt from 'bcrypt';
import Utility from '../constants/utility';
import { STATUS_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import { Admin } from '../models/Admin';
import { ERRORS } from '../constants/errors';
import { Op } from 'sequelize';
import OccupationService from '../services/occupation.service';
import { Occupation } from '../models/Occupation';
export default class UserService {
  public static async changePassword(
    accountId: string,
    userType: USER_TYPE_ENUM,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.findUserOrAdminById(accountId, userType);
      const correctOldPassword = await bcrypt.compare(
        oldPassword,
        user.password
      );

      // throw error if old password is incorrect
      if (!correctOldPassword) throw new Error('Old password is incorrect');

      // throw error if newPassword != confirmPassword
      if (newPassword != confirmPassword)
        throw new Error('New password does not match');

      if (newPassword == oldPassword)
        throw new Error('New Password cannot be the same as the Old Password');
      // change pass
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      user.password = hash;
      user.save();
    } catch (e) {
      throw e;
    }
  }

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

  public static async findUserById(accountId: string): Promise<User> {
    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    // let _user: any = Object.assign({}, user);
    // console.log('user =', user.toJSON());
    return user.toJSON();
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

  public static async updateUser(accountId: string, userDto) {
    const user = await User.findByPk(accountId);
    if (user) {
      return await user.update({
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        contactNumber: userDto.contactNumber,
      });
    } else {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  public static async updateUserAbout(
    accountId: string,
    userAbout: { headline: string; bio: string }
  ) {
    const user = await User.findByPk(accountId);
    if (user) {
      return await user.update({
        headline: userAbout.headline,
        bio: userAbout.bio,
      });
    } else {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  public static async updateUserOccupation(
    accountId: string,
    occupation: {
      name: string;
    }
  ) {
    const user = await User.findByPk(accountId);
    if (user) {
      const occ = await OccupationService.findOrCreate(occupation.name);
      await user.update({
        occupationId: occ.occupationId,
      });
      return await User.findByPk(accountId, {
        include: [Occupation],
      });
    } else {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  public static async register(registerBody: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    isStudent: boolean;
  }): Promise<User> {
    const {
      username,
      email,
      password,
      confirmPassword,
      isStudent,
    } = registerBody;

    if (!username || !email || !password || !confirmPassword) {
      throw new Error('Please enter all fields');
    }

    if (password != confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    let user, newUser;

    // check if user exist as a student or sensei
    try {
      user = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
        paranoid: false,
      });
      if (isStudent) {
        newUser = new User(
          {
            accountId: Utility.generateUUID(),
            username,
            email,
            password,
            userType: USER_TYPE_ENUM.STUDENT,
          }
          // {
          //   include: [User],
          // }
        );
      } else {
        newUser = new User(
          {
            accountId: Utility.generateUUID(),
            username,
            email,
            password,
            userType: USER_TYPE_ENUM.SENSEI,
          }
          // {
          //   include: [User],
          // }
        );
      }

      // if user exist, return error
      if (user) {
        throw new Error('Email/Username already exists');
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      newUser.save();
      return newUser;
    } catch (e) {
      throw e;
    }
  }
}
