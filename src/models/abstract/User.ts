import { Column, DataType, Table } from 'sequelize-typescript';
import { Account } from './Account';
import {
  STATUS_ENUM,
  STATUS_ENUM_OPTIONS,
  USER_TYPE_ENUM,
  USER_TYPE_ENUM_OPTIONS,
} from '../../constants/enum';
export abstract class User extends Account {
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
  // @Column
  // achievements: Achievement;
}
