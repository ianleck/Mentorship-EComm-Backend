import {
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { Account } from './abstract/Account';
import {
  ADMIN_PERMISSION_ENUM,
  ADMIN_PERMISSION_ENUM_OPTIONS,
  USER_TYPE_ENUM_OPTIONS,
  STATUS_ENUM_OPTIONS,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/constants';
@Table
export class Admin extends Account {
  @Column({ type: DataType.STRING, unique: true })
  username: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ type: DataType.STRING })
  firstName: string;

  @Column({ type: DataType.STRING })
  lastName: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.STRING })
  contactNumber: string;

  @Column({
    type: DataType.ENUM(...Object.values(STATUS_ENUM_OPTIONS)),
    defaultValue: STATUS_ENUM_OPTIONS.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({
    type: DataType.ENUM(...Object.values(USER_TYPE_ENUM_OPTIONS)),
  })
  userType: USER_TYPE_ENUM;

  @Column({
    type: DataType.ENUM(...Object.values(ADMIN_PERMISSION_ENUM_OPTIONS)),
    defaultValue: ADMIN_PERMISSION_ENUM_OPTIONS.ADMIN,
  })
  permission: ADMIN_PERMISSION_ENUM;

  @HasOne(() => Admin, 'accountId')
  updatedBy: Admin;

  @HasOne(() => Admin, 'accountId')
  createdBy: Admin;

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
