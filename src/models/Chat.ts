import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Message } from './Message';
//import { Message } from './Message';
import { User } from './User';
import { UserToChat } from './UserToChat';

@Table
export class Chat extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  chatId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId1: string;

  @Column(DataType.UUID)
  accountId2: string;

  @Unique
  @Column(DataType.STRING)
  nameOfGroup: string; //For Chat Group

  @Column(DataType.STRING)
  uniqueIdentifier: string; //For 2 users

  @Column(DataType.BOOLEAN)
  isChatGroup: boolean;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId1')
  User1: User;

  @BelongsTo(() => User, 'accountId2')
  User2: User;

  @BelongsToMany(() => User, {
    through: () => UserToChat,
    foreignKey: 'chatId',
  })
  Users: User[];

  @HasMany(() => Message, 'chatId')
  Messages: Message[];
}
