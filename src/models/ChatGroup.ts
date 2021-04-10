import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Message } from './Message';
import { User } from './User';

@Table
export class ChatGroup extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  chatGroupId: string;

  @Column(DataType.UUID)
  accountId: string;

  @Column(DataType.STRING)
  name: string;

  @CreatedAt
  @Column
  createdAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId') //creator of group
  User: User;

  @HasMany(() => Message, 'chatGroupId')
  Messages: Message[];
}
