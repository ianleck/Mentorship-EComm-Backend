import { Admin } from '../models/Admin';
import { Student } from '../models/Student';
import { Sensei } from '../models/Sensei';
import bcrypt from 'bcrypt';
import { ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import {
  USER_TYPE_ENUM_OPTIONS,
  ADMIN_PERMISSION_ENUM_OPTIONS,
  STATUS_ENUM_OPTIONS,
} from '../constants/enum';
import { Op } from 'sequelize/types';

export default class AdminService {
  public static async registerAdmin(
    registerBody: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    adminCreator
  ): Promise<void> {
    const { username, email, password, confirmPassword } = registerBody;
    let errors = [];

    if (!username || !email || !password || !confirmPassword) {
      errors.push({ msg: 'Please enter all fields' });
    }

    if (password != confirmPassword) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 8) {
      errors.push({ msg: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }

    let user, newUser;

    try {
      user = await Admin.findOne({ where: { email } });
      newUser = new Admin({
        accountId: Utility.generateUUID(),
        username,
        email,
        password,
        userType: USER_TYPE_ENUM_OPTIONS.ADMIN,
        permission: ADMIN_PERMISSION_ENUM_OPTIONS.ADMIN,
        updatedBy: adminCreator,
        createdBy: adminCreator,
      });

      // if user exist, return error
      if (user) {
        throw new Error('Email already exists');
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      newUser.save();
      return user;
    } catch (e) {
      throw e;
    }
  }

  public static async changePassword(
    accountId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const admin = await this.findAdminById(accountId);
      const correctOldPassword = await bcrypt.compare(
        oldPassword,
        admin.password
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
      admin.password = hash;
      admin.save();
    } catch (e) {
      throw e;
    }
  }

  public static async resetPassword(
    accountId: string,
    userType: USER_TYPE_ENUM_OPTIONS,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.findUserById(accountId, userType);
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

  public static async updateAdmin(accountId, adminAccount) {
    const admin = await Admin.findByPk(accountId);
    if (admin) {
      await admin.update({
        firstName: adminAccount.firstName,
        lastName: adminAccount.lastName,
        contactNumber: adminAccount.contactNumber,
      });
    } else {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }

  public static async updateAdminPermission(accountId, adminAccount) {
    const admin = await Admin.findByPk(accountId);
    if (admin) {
      await admin.update({
        permission: adminAccount.permission,
      });
    } else {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }

  public static async findAdminById(accountId: string) {
    try {
      const admin = await Admin.findByPk(accountId);
      return admin;
    } catch (e) {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }

  public static async getAllActiveStudents() {
    const students = Student.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.ACTIVE } },
    });
    return students;
  }

  public static async getAllActiveSenseis() {
    const senseis = Sensei.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.ACTIVE } },
    });
    return senseis;
  }

  public static async deactivateAdmin(accountId: string): Promise<void> {
    try {
      await Admin.destroy({
        where: {
          accountId,
        },
      });
      return;
    } catch (e) {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }
}
