import {
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  AllowNull,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Course } from './Course';
import { User } from './User';

@Table
export class Announcement extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  announcementId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @Default('')
  @Column(DataType.STRING)
  title: string;

  @Default('')
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.UUID)
  courseId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => Course, {
    onDelete: 'CASCADE',
    onUpdate: 'no action',
    foreignKey: {
      name: 'courseId',
      allowNull: false,
    },
  })
  Course: Course;

  @BelongsTo(() => User, 'accountId')
  Sensei: User;
}
