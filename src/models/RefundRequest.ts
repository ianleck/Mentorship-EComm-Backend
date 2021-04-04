import {
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

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => User, 'accountId')
  RequestOwner: User;

  @HasOne(() => Admin, 'accountId')
  ApprovedBy: Admin;

  @HasOne(() => Billing, 'billingId')
  OriginalBilling: Billing;

  @HasOne(() => Billing, 'billingId')
  Refund: Billing;
}
