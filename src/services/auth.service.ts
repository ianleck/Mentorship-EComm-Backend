import { AUTH_ERRORS, ERRORS } from '../constants/errors';
import { ResetToken } from '../models/ResetToken';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { RESET_PASSWORD_URL } from '../constants/constants';
import EmailService from './email.service';
import { Op } from 'sequelize';
import { USER_TYPE_ENUM } from '../constants/enum';
import UserService from './user.service';

export default class AuthService {
  // ================================ USER AUTH ================================

  public static async changePassword(
    accountId: string,
    userType: USER_TYPE_ENUM,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await UserService.findUserOrAdminById(accountId, userType);
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
        newUser = new User({
          username,
          email,
          password,
          userType: USER_TYPE_ENUM.STUDENT,
        });
      } else {
        newUser = new User({
          username,
          email,
          password,
          userType: USER_TYPE_ENUM.SENSEI,
        });
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

      await EmailService.sendEmail(email, 'register');

      return newUser;
    } catch (e) {
      throw e;
    }
  }

  public static async forgotPassword(email: string) {
    // Check for existing user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error(ERRORS.USER_DOES_NOT_EXIST);
    }
    // Destroy existing token
    const existingToken = await ResetToken.findOne({
      where: { accountId: user.accountId },
    });
    if (existingToken) {
      await existingToken.destroy();
    }

    // Generate resetToken
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);
    const createdAt = new Date();
    const expiredAt = new Date();
    expiredAt.setMinutes(createdAt.getMinutes() + 10);

    await new ResetToken({
      hash,
      accountId: user.accountId,
      createdAt,
      expiredAt,
    }).save();

    const url = `${RESET_PASSWORD_URL}/reset-password?token=${resetToken}&id=${user.accountId}`;
    const additional = { url };
    await EmailService.sendEmail(user.email, 'forgotPassword', additional);
  }

  public static async resetPassword(
    resetToken: string,
    accountId: string,
    password: string
  ) {
    const passwordResetToken = await ResetToken.findOne({
      where: { accountId },
    });

    if (!passwordResetToken || !(passwordResetToken.expiredAt > new Date()))
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);

    const isValid = await bcrypt.compare(resetToken, passwordResetToken.hash);

    if (!isValid) throw new Error(AUTH_ERRORS.INVALID_TOKEN);

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findByPk(accountId);
    if (!user) throw new Error(ERRORS.USER_DOES_NOT_EXIST);

    await user.update({ password: hashedPassword });

    await ResetToken.destroy({ where: { accountId } });

    await EmailService.sendEmail(user.email, 'passwordReset');
  }
}
