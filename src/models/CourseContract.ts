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
import { Course } from './Course';
import { User } from './User';
import { CONTRACT_PROGRESS_ENUM } from '../constants/enum';

@Table
export class CourseContract extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  courseContracttId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string; // studentId

  @AllowNull(false)
  @Column(DataType.UUID)
  courseId: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(CONTRACT_PROGRESS_ENUM),
    defaultValue: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
  })
  progress: CONTRACT_PROGRESS_ENUM;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Student: User;

  @BelongsTo(() => Course, 'courseId')
  Course: Course;
}

// one to one mapping for Review
// has Subscription oto
