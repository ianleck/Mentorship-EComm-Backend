import { Student } from "../models/Student";
import bcrypt from "bcrypt";
import Utility from "../constants/utility";
import {
  ADMIN_PERMISSION_ENUM_OPTIONS,
  USER_TYPE_ENUM_OPTIONS,
} from "../constants/enum";
import { Sensei } from "../models/Sensei";
import { Admin } from "../models/Admin";
import { ERRORS } from "../constants/errors";

export default class UserService {
  public static async changePassword(
    accountId: string,
    userType: USER_TYPE_ENUM_OPTIONS,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.findUser(accountId, userType);
      const correctOldPassword = await bcrypt.compare(
        oldPassword,
        user.password
      );

      // throw error if old password is incorrect
      if (!correctOldPassword) throw new Error("Old password is incorrect");

      // throw error if newPassword != confirmPassword
      if (newPassword != confirmPassword)
        throw new Error("New password does not match");

      // change pass
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      user.password = hash;
      user.save();
    } catch (e) {
      throw e;
    }
  }

  public static async findUser(
    accountId: string,
    userType: USER_TYPE_ENUM_OPTIONS
  ): Promise<Student | Sensei | Admin> {
    let user: Student | Sensei | Admin;
    try {
      if (userType == USER_TYPE_ENUM_OPTIONS.STUDENT) {
        user = await Student.findByPk(accountId);
      } else if (userType == USER_TYPE_ENUM_OPTIONS.SENSEI) {
        user = await Sensei.findByPk(accountId);
      } else if (userType == USER_TYPE_ENUM_OPTIONS.ADMIN) {
        user = await Admin.findByPk(accountId);
      }
      return user;
    } catch (e) {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }

  public static async register(registerBody: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    isStudent: boolean;
  }): Promise<void> {
    const {
      username,
      email,
      password,
      confirmPassword,
      isStudent,
    } = registerBody;
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
    let user, newUser;

    // check if user exist as a student or sensei
    try {
      if (isStudent) {
        user = await Student.findOne({ where: { email } });
        newUser = new Student({
          accountId: Utility.generateUUID(),
          username,
          email,
          password,
          userType: USER_TYPE_ENUM_OPTIONS.STUDENT,
        });
      } else {
        user = await Sensei.findOne({ where: { email } });
        newUser = new Sensei({
          accountId: Utility.generateUUID(),
          username,
          email,
          password,
          userType: USER_TYPE_ENUM_OPTIONS.SENSEI,
        });
      }

      // if user exist, return error
      if (user) {
        throw new Error("Email already exists");
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

  public static async findUserById(
    accountId: string,
    userType: USER_TYPE_ENUM_OPTIONS
  ): Promise<Student | Sensei | Admin> {
    try {
      if (userType == USER_TYPE_ENUM_OPTIONS.STUDENT) {
        return Student.findByPk(accountId);
      }
      if (userType == USER_TYPE_ENUM_OPTIONS.SENSEI) {
        return Sensei.findByPk(accountId);
      }
      if (userType == USER_TYPE_ENUM_OPTIONS.ADMIN) {
        return Admin.findByPk(accountId);
      }
    } catch (e) {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
  }
}
