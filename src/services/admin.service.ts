import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import {
  ADMIN_PERMISSION_ENUM,
  ADMIN_VERIFIED_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { AUTH_ERRORS, ERRORS } from '../constants/errors';
import { Admin } from '../models/Admin';
import { User } from '../models/User';
import EmailService from './email.service';
export default class AdminService {
  public static async deactivateAdmin(
    accountId: string,
    superAdminId: string
  ): Promise<void> {
    const superAdmin = await Admin.findByPk(superAdminId);
    const admin = await Admin.findByPk(accountId);
    if (!admin) throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    await admin.update({
      updatedBy: superAdmin,
    });
    await admin.destroy();
  }

  public static async findAdminById(accountId: string) {
    const admin = await Admin.findByPk(accountId);
    if (!admin) throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    return admin;
  }

  public static async getAllAdmins() {
    const admins = Admin.findAll();
    return admins;
  }

  public static async getAllBannedStudents() {
    const students = User.findAll({
      where: {
        status: { [Op.eq]: STATUS_ENUM.BANNED },
        userType: USER_TYPE_ENUM.STUDENT,
      },
    });
    return students;
  }

  public static async getAllBannedSenseis() {
    const senseis = User.findAll({
      where: {
        status: { [Op.eq]: STATUS_ENUM.BANNED },
        userType: USER_TYPE_ENUM.SENSEI,
      },
    });
    return senseis;
  }

  public static async getAllPendingSenseis() {
    const senseis = User.findAll({
      where: {
        adminVerified: ADMIN_VERIFIED_ENUM.PENDING,
        userType: USER_TYPE_ENUM.SENSEI,
      },
    });
    return senseis;
  }

  /*

  public static async getAllMentorshipContracts() {
    const mentorshipContracts = MentorshipContract.findAll();
    return mentorshipContracts;
  }
  */

  public static async registerAdmin(
    registerBody: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    adminCreatorId: string
  ): Promise<Admin> {
    const { username, email, password, confirmPassword } = registerBody;
    const adminCreator = await Admin.findByPk(adminCreatorId);

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

    try {
      user = await Admin.findOne({ where: { email } });
      newUser = new Admin({
        username,
        email,
        password,
        userType: USER_TYPE_ENUM.ADMIN,
        permission: ADMIN_PERMISSION_ENUM.ADMIN,
        updatedBy: adminCreator,
        createdBy: adminCreator,
      });

      // if user exist, return error
      if (user) {
        throw new Error(AUTH_ERRORS.ADMIN_EXISTS);
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newUser.password, salt);
      newUser.password = hash;
      await newUser.save();
      return newUser;
    } catch (e) {
      throw e;
    }
  }

  public static async resetPassword(
    accountId: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.findAdminById(accountId);

      // throw error if newPassword != confirmPassword
      if (newPassword != confirmPassword)
        throw new Error(AUTH_ERRORS.NEW_PASSWORD_MISMATCH);

      // change pass
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      user.password = hash;
      await user.save();
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

  public static async updateAdminPermission(
    accountId,
    adminAccount,
    superAdminId
  ) {
    const admin = await Admin.findByPk(accountId);
    const superAdmin = await Admin.findByPk(superAdminId);

    if (admin) {
      return await admin.update({
        permission: adminAccount.permission,
        updatedBy: superAdmin,
      });
    } else {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }

  public static async acceptSenseiProfile(accountId) {
    const sensei = await User.findOne({
      where: { accountId, adminVerified: ADMIN_VERIFIED_ENUM.PENDING },
    });
    if (sensei) {
      await sensei.update({
        adminVerified: ADMIN_VERIFIED_ENUM.ACCEPTED,
      });
      await EmailService.sendEmail(sensei.email, 'acceptSensei');
    } else {
      throw new Error(ERRORS.SENSEI_NOT_PENDING);
    }

    return sensei;
  }

  public static async rejectSenseiProfile(accountId) {
    const sensei = await User.findOne({
      where: { accountId, adminVerified: ADMIN_VERIFIED_ENUM.PENDING },
    });
    if (sensei) {
      await sensei.update({
        adminVerified: ADMIN_VERIFIED_ENUM.REJECTED,
      });
      await EmailService.sendEmail(sensei.email, 'rejectSensei');
    } else {
      throw new Error(ERRORS.SENSEI_NOT_PENDING);
    }

    return sensei;
  }
}
