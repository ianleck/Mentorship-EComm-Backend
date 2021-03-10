import {
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Comment } from './Comment';
import { Course } from './Course';
@Table
export class Lesson extends Model<BaseEntity> {
  /**
   * title
   * assessmentUrl
   * videoUrl
   * description
   * lessonFileUrl
   * comments
   */
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  lessonId: string;

  @Default('')
  @Column(DataType.STRING)
  title: string;

  @Default('')
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  assessmentUrl: string;

  @Column(DataType.TEXT)
  videoUrl: string;

  @Column(DataType.TEXT)
  lessonFileUrl: string;

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

  @HasMany(() => Comment, 'lessonId')
  Comments: Comment[];
}
