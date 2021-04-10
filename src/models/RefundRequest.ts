import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { APPROVAL_STATUS, BILLING_TYPE } from '../constants/enum';
import { Admin } from './Admin';
import { Billing } from './Billing';
import { CourseContract } from './CourseContract';
import { MentorshipContract } from './MentorshipContract';
import { User } from './User';

@Table
export class RefundRequest extends Model<RefundRequest> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  refundRequestId: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(APPROVAL_STATUS),
    defaultValue: APPROVAL_STATUS.PENDING,
  })
  approvalStatus: APPROVAL_STATUS;

  @AllowNull(false)
  @Column(DataType.UUID)
  contractId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  studentId: string; //request owner

  @Column(DataType.UUID)
  adminId: string; // Approve/Reject

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(BILLING_TYPE),
  })
  contractType: BILLING_TYPE;

  @Column(DataType.INTEGER)
  mentorPassCount: number;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => User, { foreignKey: 'studentId', targetKey: 'accountId' })
  RequestOwner: User;

  @BelongsTo(() => Admin, { foreignKey: 'adminId', targetKey: 'accountId' })
  AdminHandler: Admin;

  @HasOne(() => Billing, 'billingId')
  Refund: Billing;

  @HasMany(() => Billing, 'billingId')
  OriginalBillings: Billing;

  @BelongsTo(() => CourseContract, {
    foreignKey: 'contractId',
    targetKey: 'courseContractId',
  })
  CourseContract: CourseContract;

  @BelongsTo(() => MentorshipContract, {
    foreignKey: 'contractId',
    targetKey: 'mentorshipContractId',
  })
  MentorshipContract: MentorshipContract;
}
