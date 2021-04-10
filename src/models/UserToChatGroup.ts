import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ChatGroup } from './ChatGroup';
import { User } from './User';

@Table
export class UserToChatGroup extends Model<UserToChatGroup> {
  @ForeignKey(() => ChatGroup)
  @Column(DataType.UUID)
  chatGroupId: string;

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
