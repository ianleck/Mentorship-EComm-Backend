import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
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

  // Id of Course/Mentorshiplisting
  @Column(DataType.UUID)
  productId: string;

  // Id of CourseContract/MentorshipContract
  @Column(DataType.UUID)
  contractId: string;

  // Price of course
  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  // Only appears for billings from admin to sensei, where the platform fee = amount * 5% (Our platform revenue)
  @Column(DataType.FLOAT)
  platformFee: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  senderWalletId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  receiverWalletId: string;

  // Billing status to track billing and act as a param for filtering
  @AllowNull(false)
  @Column({
    type: DataType.ENUM,
    values: Object.values(BILLING_STATUS),
  })
  status: BILLING_STATUS;

  // date billing is created + 120 days. This is only for billing from admin to sensei, and tells them when the amount for each billing is withdrawable
  @Column(DataType.DATE)
  withdrawableDate: Date;

  // Filter for withdrawals, which will also be reflected as a billing
  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  withdrawalApplication: Boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isCourseBilling: Boolean;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => Course, { foreignKey: 'productId', targetKey: 'courseId' })
  Course: Course;

  @BelongsTo(() => CourseContract, {
    foreignKey: 'contractId',
    targetKey: 'courseContractId',
  })
  CourseContract: CourseContract;

  @BelongsTo(() => MentorshipListing, {
    foreignKey: 'productId',
    targetKey: 'mentorshipListingId',
  })
  MentorshipListing: MentorshipListing;
}
