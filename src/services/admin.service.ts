import { Admin } from '../models/Admin';
import bcrypt from 'bcrypt';
import { ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import {
  USER_TYPE_ENUM,
  ADMIN_PERMISSION_ENUM,
  STATUS_ENUM,
} from '../constants/enum';
import { Op } from 'sequelize';
import { User } from '../models/User';
export default class AdminService {
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
        accountId: Utility.generateUUID(),
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
        throw new Error('Email already exists');
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

  public static async getAllBannedStudents() {
    const students = User.findAll({
      where: {
        status: { [Op.eq]: STATUS_ENUM.BANNED },
        userType: USER_TYPE_ENUM.SENSEI,
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
