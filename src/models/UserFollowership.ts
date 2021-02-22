import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User';

@Table
export class UserFollowership extends Model {
  @ForeignKey(() => User)
  @Column
  followerId: string;

  @ForeignKey(() => User)
  @Column
  followingId: string;
}
