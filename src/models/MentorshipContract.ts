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
import {
  CONTRACT_PROGRESS_ENUM,
  MENTORSHIP_CONTRACT_APPROVAL,
} from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipListing } from './MentorshipListing';
import { TaskBucket } from './TaskBucket';
import { User } from './User';

@Table
export class MentorshipContract extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  mentorshipContractId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string; // studentId

  @AllowNull(false)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @Column(DataType.STRING)
  statement: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(CONTRACT_PROGRESS_ENUM),
    defaultValue: CONTRACT_PROGRESS_ENUM.NOT_STARTED,
  })
  progress: CONTRACT_PROGRESS_ENUM;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(MENTORSHIP_CONTRACT_APPROVAL),
    defaultValue: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
  })
  senseiApproval: MENTORSHIP_CONTRACT_APPROVAL;

  @Column(DataType.INTEGER)
  mentorPass: number;
  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Student: User;

  @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;

  @HasMany(() => TaskBucket, 'mentorshipContractId')
  TaskBuckets: TaskBucket[];
}

// one to one mapping for Review
