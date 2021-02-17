import { Student } from "../models/Student";
import bcrypt from "bcrypt";
import Utility from "../constants/utility";
import { USER_TYPE_ENUM_OPTIONS } from "../constants/enum";
import { Sensei } from "../models/Sensei";

export default class UserService {
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
}
