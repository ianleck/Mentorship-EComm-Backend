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
import { Post } from './Post';

@Table
export class LikePost extends Model<LikePost> {
  @ForeignKey(() => Post)
  @Column(DataType.UUID)
  postId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  accountId: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
