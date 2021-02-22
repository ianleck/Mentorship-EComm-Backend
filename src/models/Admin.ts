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
  @Column({ field: 'username', type: DataType.STRING, unique: true })
  username: string;

  @Column({ field: 'password', type: DataType.STRING })
  password: string;

  @Column({ field: 'first_name', type: DataType.STRING })
  firstName: string;

  @Column({ field: 'last_name', type: DataType.STRING })
  lastName: string;

  @Column({
    field: 'email_verified',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({ field: 'email', type: DataType.STRING, unique: true })
  email: string;

  @Column({ field: 'contact_number', type: DataType.STRING })
  contactNumber: string;

  @Column({
    field: 'status',
    type: DataType.ENUM(...Object.values(STATUS_ENUM_OPTIONS)),
    defaultValue: STATUS_ENUM_OPTIONS.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({
    field: 'user_type',
    type: DataType.ENUM(...Object.values(USER_TYPE_ENUM_OPTIONS)),
  })
  userType: USER_TYPE_ENUM;

  @ForeignKey(() => Admin)
  @Column({
    field: 'admin_id',
    type: DataType.INTEGER,
    autoIncrement: true,
    unique: true,
  })
  adminId: number;

  @Column({
    field: 'permission',
    type: DataType.ENUM(...Object.values(ADMIN_PERMISSION_ENUM_OPTIONS)),
    defaultValue: ADMIN_PERMISSION_ENUM_OPTIONS.ADMIN,
  })
  permission: ADMIN_PERMISSION_ENUM;

  @HasOne(() => Admin)
  updatedBy: Admin;

  @HasOne(() => Admin, 'admin_id')
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
