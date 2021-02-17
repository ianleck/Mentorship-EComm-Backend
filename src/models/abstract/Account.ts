import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseEntity } from './BaseEntity';

// @Table
export abstract class Account extends BaseEntity {
  @Column({
    field: 'account_id',
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  accountId: string;

  @Column({ field: 'paypal_id', type: DataType.STRING })
  paypalId: number;
}
