import {
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CURRENCY } from '../constants/constants';
import { BaseEntity } from './abstract/BaseEntity';

@Table
export class Billing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  billingId: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING,
  })
  paypalBillingId: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: '0',
  })
  amount: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: CURRENCY,
  })
  currency: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: CURRENCY,
  })
  senderWalletId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: CURRENCY,
  })
  receiverWalletId: string;
}
