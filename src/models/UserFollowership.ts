import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';
import {
  FOLLOWING_ENUM,
} from '../constants/enum';

@Table
export class UserFollowership extends Model<UserFollowership> {
  @ForeignKey(() => User)
  @Column
  followerId: string;

  @ForeignKey(() => User)
  @Column
  followingId: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(FOLLOWING_ENUM),
    defaultValue: FOLLOWING_ENUM.PENDING,
  })
  followingStatus: FOLLOWING_ENUM; 

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;




}
