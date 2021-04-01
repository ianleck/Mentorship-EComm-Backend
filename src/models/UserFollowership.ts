import {
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';
import { FOLLOWING_ENUM } from '../constants/enum';

@Table
export class UserFollowership extends Model<UserFollowership> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  followershipId: string;

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
