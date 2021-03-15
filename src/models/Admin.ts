import jwt from 'jsonwebtoken';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  HasOne,
  Table,
  Unique,
} from 'sequelize-typescript';
import { JWT_SECRET } from '../constants/constants';
import { ADMIN_ROLE_ENUM, USER_TYPE_ENUM } from '../constants/enum';
import { Account } from './abstract/Account';
import { Wallet } from './Wallet';
@Table
export class Admin extends Account {
  @Unique
  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  firstName: string;

  @Column(DataType.STRING)
  lastName: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  emailVerified: boolean;

  @Unique
  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  contactNumber: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(USER_TYPE_ENUM),
    defaultValue: USER_TYPE_ENUM.ADMIN,
  })
  userType: USER_TYPE_ENUM;

  @Column({
    type: DataType.ENUM,
    values: Object.values(ADMIN_ROLE_ENUM),
    defaultValue: ADMIN_ROLE_ENUM.ADMIN,
  })
  role: ADMIN_ROLE_ENUM;

  // ==================== PAYMENT SETTINGS ====================
  @Unique
  @Column(DataType.STRING)
  walletId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @HasOne(() => Admin, 'accountId')
  updatedBy: Admin;

  @HasOne(() => Admin, 'accountId')
  createdBy: Admin;

  @BelongsTo(() => Wallet, 'ownerId')
  Wallet: Wallet;

  // ==================== ADMIN FUNCTIONS ====================

  generateJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 1);
    let user: any = Object.assign({}, this.get());
    delete user.password;
    return jwt.sign(
      {
        ...user,
        exp: expirationDate.getTime() / 1000,
      },
      JWT_SECRET
    );
  }

  toAuthJSON() {
    return {
      user: this.toJSON(),
      accessToken: this.generateJWT(),
    };
  }

  toJSON() {
    let user: any = Object.assign({}, this.get());

    delete user.password;
    return user;
  }
}
