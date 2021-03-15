import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';

@Table
export class UserFollowership extends Model<UserFollowership> {
  @ForeignKey(() => User)
  @Column
  followerId: string;

  @ForeignKey(() => User)
  @Column
  followingId: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
