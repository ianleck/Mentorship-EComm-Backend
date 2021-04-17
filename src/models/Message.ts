import {
  AllowNull,
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
import { Chat } from './Chat';
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
  chatId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  messageBody: string;

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

  @BelongsTo(() => User, {
    foreignKey: {
      name: 'receiverId',
      allowNull: false,
    },
  })
  Receiver: User;

  @BelongsTo(() => Chat, 'chatId')
  Chat: Chat;
}
