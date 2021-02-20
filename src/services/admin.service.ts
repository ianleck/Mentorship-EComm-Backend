import { Admin } from '../models/Admin';
import { Student } from '../models/Student';
import { Sensei } from '../models/Sensei';
import bcrypt from 'bcrypt';
import { ERRORS } from '../constants/errors';
import Utility from '../constants/utility';
import {
  USER_TYPE_ENUM_OPTIONS,
  ADMIN_PERMISSION_ENUM_OPTIONS,
} from '../constants/enum';

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

  public static async updateAdmin(accountId: string, adminAccount) {
    const admin = await Admin.findByPk(accountId);
    if (admin) {
      await admin.update({
        firstName: adminAccount.firstName,
        lastName: adminAccount.lastName,
        contactNumber: adminAccount.contactNumber,
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

  public static async getAllStudents() {
    const students = Student.findAll();
    return students;
  }

  public static async getAllSenseis() {
    const senseis = Sensei.findAll();
    return senseis;
  }

  public static async findAdminByIdAndRemove(adminId: string) {
    let admin;
    try {
      admin = await Admin.findOne({ where: { adminId } });
      return Admin.destroy({ where: { adminId } });
    } catch (e) {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }
}
