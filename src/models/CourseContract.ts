import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasOne,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CONTRACT_PROGRESS_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Billing } from './Billing';
import { Course } from './Course';
import { User } from './User';

@Table
export class CourseContract extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  courseContractId: string;

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

  @HasOne(() => Billing, 'contractId')
  Billing: Billing;
}

// one to one mapping for Review
// has Subscription oto
