import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  HasMany,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { CURRENCY, STARTING_BALANCE } from '../constants/constants';
import { BaseEntity } from './abstract/BaseEntity';
import { Admin } from './Admin';
import { Billing } from './Billing';
import { User } from './User';

@Table
export class Wallet extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  walletId: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.UUID)
  accountId: string;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  pendingAmount: number;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  confirmedAmount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'walletId')
  WalletOwner: User;

  @HasMany(() => Admin, 'walletId')
  AdminAccess: Admin;

  @HasMany(() => Billing, 'senderWalletId')
  billingsSent: Billing[];

  @HasMany(() => Billing, 'receiverWalletId')
  billingsReceived: Billing[];
}
