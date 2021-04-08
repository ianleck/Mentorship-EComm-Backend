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
import { APPROVAL_STATUS } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Admin } from './Admin';
import { Billing } from './Billing';
import { CourseContract } from './CourseContract';
import { MentorshipContract } from './MentorshipContract';
import { User } from './User';

@Table
export class RefundRequest extends BaseEntity {
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

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => User, { foreignKey: 'studentId', targetKey: 'accountId' })
  RequestOwner: User;

  @BelongsTo(() => Admin, { foreignKey: 'adminId', targetKey: 'accountId' })
  AdminHandler: Admin;

  @HasOne(() => Billing, 'billingId')
  Refund: Billing;

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
