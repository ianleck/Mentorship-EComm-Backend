import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Chat } from './Chat';
import { User } from './User';

@Table
export class UserToChat extends Model<UserToChat> {
  @ForeignKey(() => Chat)
  @Column(DataType.UUID)
  chatId: string;

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
