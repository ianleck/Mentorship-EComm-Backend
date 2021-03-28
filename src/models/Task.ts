import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CONTRACT_PROGRESS_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { TaskBucket } from './TaskBucket';

@Table
export class Task extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  taskId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.TEXT)
  attachmentUrl: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(CONTRACT_PROGRESS_ENUM),
    defaultValue: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
  })
  progress: CONTRACT_PROGRESS_ENUM;

  @Default(null)
  @Column(DataType.DATE)
  dueAt: Date;

  @CreatedAt
  @Column
  createdAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => TaskBucket, 'taskBucketId')
  TaskBucket: TaskBucket;
}
