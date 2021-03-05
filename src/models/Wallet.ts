import {
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CURRENCY } from '../constants/constants';
import { BaseEntity } from './abstract/BaseEntity';
import { Billing } from './Billing';
import { User } from './User';

@Table
export class Wallet extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  walletId: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: '0.00',
  })
  pendingAmount: number;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
    defaultValue: '0.00',
  })
  confirmedAmount: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: CURRENCY,
  })
  currency: string;

  @BelongsTo(() => User, 'accountId')
  WalletOwner: User;

  @HasMany(() => Billing, 'senderWalletId')
  billingsSent: Billing[];

  @HasMany(() => Billing, 'receiverWalletId')
  billingsReceived: Billing[];
}
