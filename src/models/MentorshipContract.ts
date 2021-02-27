import {
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  MENTORSHIP_CONTRACT_APPROVAL,
  MENTORSHIP_PROGRESS_ENUM,
} from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipListing } from './MentorshipListing';
import { User } from './User';

@Table
export class MentorshipContract extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  mentorshipContractId: string;

  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  studentId: string;

  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  mentorshipListingId: string;

  @Column(DataType.STRING)
  statement: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(MENTORSHIP_PROGRESS_ENUM),
    defaultValue: MENTORSHIP_PROGRESS_ENUM.NOT_STARTED,
  })
  progress: MENTORSHIP_PROGRESS_ENUM;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(MENTORSHIP_CONTRACT_APPROVAL),
    defaultValue: MENTORSHIP_CONTRACT_APPROVAL.PENDING,
  })
  senseiApproval: MENTORSHIP_CONTRACT_APPROVAL;

  @BelongsTo(() => User, 'accountId')
  Student: User;

  @BelongsTo(() => MentorshipListing, {
    onDelete: 'CASCADE',
    onUpdate: 'no action',
    foreignKey: {
      name: 'mentorshipListingId',
      allowNull: false,
    },
  })
  MentorshipListing: MentorshipListing;
}

// one to one mapping for Review
// has Subscription oto
