import {
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { User } from './abstract/User';
import {
  ADMIN_PERMISSION_ENUM,
  ADMIN_PERMISSION_ENUM_OPTIONS,
} from '../constants/enum';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/constants';
@Table
export class Admin extends User {
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
