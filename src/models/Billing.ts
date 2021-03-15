import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasOne,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CURRENCY, STARTING_BALANCE } from '../constants/constants';
import { BILLING_STATUS } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Course } from './Course';
import { CourseContract } from './CourseContract';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Billing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  billingId: string;

  @Column(DataType.STRING)
  paypalPayerId: string;

  @Column(DataType.STRING)
  paypalPaymentId: string;

  @Column(DataType.STRING)
  courseId: string;

  @Column(DataType.STRING)
  courseContractId: string;

  @Column(DataType.STRING)
  mentorshipListingId: string;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @Column(DataType.FLOAT)
  platformFee: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  senderWalletId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  receiverWalletId: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM,
    values: Object.values(BILLING_STATUS),
  })
  status: BILLING_STATUS;

  @Column(DataType.DATE)
  withdrawableDate: Date;

  @Column(DataType.DATE)
  withdrawnDate: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  withdrawalApplication: Boolean;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @HasOne(() => Course, 'courseId')
  Course: Course;

  @HasOne(() => CourseContract, 'courseContractId')
  CourseContract: CourseContract;

  @HasOne(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;
}
