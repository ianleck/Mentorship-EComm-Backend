import {
  AllowNull,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { CURRENCY, STARTING_BALANCE } from '../constants/constants';
import { BILLING_STATUS } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';

@Table
export class Billing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  billingId: string;

  @Column(DataType.STRING)
  paypalPayerId: string;

  @Unique
  @Column(DataType.STRING)
  paypalPaymentId: string;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  senderWalletId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  receiverWalletId: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(BILLING_STATUS),
  })
  status: BILLING_STATUS;
}
