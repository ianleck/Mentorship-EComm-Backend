import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { ChatGroup } from './ChatGroup';
import { User } from './User';

@Table
export class Message extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  messageId: string;

  @Column(DataType.UUID)
  senderId: string;

  @Column(DataType.UUID)
  receiverId: string;

  @Column(DataType.UUID)
  chatGroupId: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.STRING)
  uniqueIdentifier: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, {
    foreignKey: {
      name: 'senderId',
      allowNull: false,
    },
  })
  Sender: User;

  @BelongsTo(() => ChatGroup, 'chatGroupId')
  ChatGroup: ChatGroup;
}
