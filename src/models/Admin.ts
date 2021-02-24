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
  USER_TYPE_ENUM,
  STATUS_ENUM,
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
    type: DataType.ENUM(...Object.values(STATUS_ENUM)),
    defaultValue: STATUS_ENUM.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({
    type: DataType.ENUM(...Object.values(USER_TYPE_ENUM)),
  })
  userType: USER_TYPE_ENUM;

  @ForeignKey(() => Admin)
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    unique: true,
  })
  adminId: number;

  @Column({
    type: DataType.ENUM(...Object.values(ADMIN_PERMISSION_ENUM)),
    defaultValue: ADMIN_PERMISSION_ENUM.ADMIN,
  })
  permission: ADMIN_PERMISSION_ENUM;

  @HasOne(() => Admin, 'adminId')
  updatedBy: Admin;

  @HasOne(() => Admin, 'adminId')
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
