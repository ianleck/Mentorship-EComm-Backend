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
import { Op } from 'sequelize';

export default class AdminService {
  public static async registerAdmin(
    registerBody: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    adminCreatorId: string
  ): Promise<void> {
    const { username, email, password, confirmPassword } = registerBody;
    let errors = [];
    const adminCreator = await Admin.findByPk(adminCreatorId);

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

  public static async resetPassword(
    accountId: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.findAdminById(accountId);

      // throw error if newPassword != confirmPassword
      if (newPassword != confirmPassword)
        throw new Error('New password does not match');

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

  public static async findAdminById(accountId: string) {
    const admin = await Admin.findByPk(accountId);
    if (!admin) throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    return admin;
  }

  public static async getAllAdmins() {
    const admins = Admin.findAll();
    return admins;
  }

  public static async getAllActiveStudents() {
    const students = Student.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.ACTIVE } },
    });
    return students;
  }

  public static async getAllBannedStudents() {
    const students = Student.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.BANNED } },
    });
    return students;
  }

  public static async getAllBannedSenseis() {
    const senseis = Sensei.findAll({
      where: { status: { [Op.eq]: STATUS_ENUM_OPTIONS.BANNED } },
    });
    return senseis;
  }

  /*
  public static async getSenseiMentorshipListings(accountId: string) {
    const sensei = await Sensei.findByPk(accountId);
    const mentorshipListings = sensei.mentorshipListing ; 
    if (!sensei) throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    return mentorshipListings;
  }

 

  public static async getAllMentorshipListings() {
    const mentorshipListings = MentorshipListing.findAll(); 
    return mentorshipListings;
  }

  */

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
}
