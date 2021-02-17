import { Admin } from "../models/Admin";
import bcrypt from "bcrypt";
import { ERRORS } from "../constants/errors";
import Utility from "../constants/utility";
import {
  USER_TYPE_ENUM_OPTIONS,
  ADMIN_PERMISSION_ENUM_OPTIONS,
} from "../constants/enum";

export default class AdminService {
  public static async registerAdmin(registerBody: {
    adminAccountId: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> {
    const { username, email, password, confirmPassword } = registerBody;
    let errors = [];

    if (!username || !email || !password || !confirmPassword) {
      errors.push({ msg: "Please enter all fields" });
    }

    if (password != confirmPassword) {
      errors.push({ msg: "Passwords do not match" });
    }

    if (password.length < 8) {
      errors.push({ msg: "Password must be at least 8 characters" });
    }

    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }

    let admin, newAdmin;

    try {
      admin = await Admin.findOne({ where: { email } });
      newAdmin = new Admin({
        accountId: Utility.generateUUID(),
        username,
        email,
        password,
        userType: USER_TYPE_ENUM_OPTIONS.ADMIN,
        permission: ADMIN_PERMISSION_ENUM_OPTIONS.ADMIN,
        updatedBy: admin,
        createdBy: admin,
      });

      // if user exist, return error
      if (admin) {
        throw new Error("Email already exists");
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newAdmin.password, salt);
      newAdmin.password = hash;
      newAdmin.save();
      return admin;
    } catch (e) {
      throw e;
    }
  }

  public static async updateAdmin(adminDto) {
    const admin = await Admin.findByPk(adminDto.accountId);
    if (admin) {
      await admin.update({
        username: adminDto.username,
        email: adminDto.email,
      });
    } else {
      throw new Error(ERRORS.ADMIN_DOES_NOT_EXIST);
    }
  }
}
