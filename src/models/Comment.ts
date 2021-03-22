import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Lesson } from './Lesson';
import { Post } from './Post';
import { User } from './User';

@Table
export class Comment extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  commentId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.UUID)
  lessonId: string;

  @Column(DataType.UUID)
  accountId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => Lesson, 'lessonId')
  Lesson: Lesson;

  @BelongsTo(() => User, 'accountId')
  User: User;

  @BelongsTo(() => Post, 'postId')
  Post: Post;
}
