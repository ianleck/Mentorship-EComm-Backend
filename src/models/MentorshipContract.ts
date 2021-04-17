import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { APPROVAL_STATUS, CONTRACT_PROGRESS_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipListing } from './MentorshipListing';
import { TaskBucket } from './TaskBucket';
import { Testimonial } from './Testimonial';
import { User } from './User';

export interface MentorshipApplicationFields {
  applicationReason: Text;
  stepsTaken?: Text;
  idealDuration?: number;
  goals: Text;
  additionalInfo?: Text;
}
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

  @AllowNull(false)
  @Column(DataType.JSON)
  applicationFields: MentorshipApplicationFields;

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
    values: Object.values(APPROVAL_STATUS),
    defaultValue: APPROVAL_STATUS.PENDING,
  })
  senseiApproval: APPROVAL_STATUS;

  @Default(0)
  @Column(DataType.INTEGER)
  mentorPassCount: number; // Number of mentor passes
  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Student: User;

  @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;

  @HasMany(() => TaskBucket, 'mentorshipContractId')
  TaskBuckets: TaskBucket[];

  @HasOne(() => Testimonial, 'mentorshipContractId')
  Testimonial: Testimonial;
}

// one to one mapping for Review
