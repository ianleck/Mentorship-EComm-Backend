import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipContract } from './MentorshipContract';
import { Task } from './Task';

@Table
export class TaskBucket extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  taskBucketId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  mentorshipContractId: string;

  @Default('')
  @Column(DataType.STRING)
  title: string;

  @Default([])
  @Column(DataType.JSON)
  taskOrder: string[];

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => MentorshipContract, 'mentorshipContractId')
  MentorshipContract: MentorshipContract;

  @HasMany(() => Task, 'taskBucketId')
  Tasks: Task[];
}
