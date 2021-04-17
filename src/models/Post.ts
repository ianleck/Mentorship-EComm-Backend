import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { User } from './User';
import { Comment } from './Comment';
import { LikePost } from './LikePost';

@Table
export class Post extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  postId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @Default('')
  @Column(DataType.TEXT)
  content: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => User, 'accountId')
  User: User;

  @HasMany(() => Comment, 'postId')
  Comments: Comment[];

  @HasMany(() => LikePost, {
    foreignKey: {
      name: 'postId',
      allowNull: false,
    },
  })
  LikePost: LikePost;
}
