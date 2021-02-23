import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseEntity } from './BaseEntity';

// @Table
export abstract class Account extends BaseEntity {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  accountId: string;

  @Column({ type: DataType.STRING })
  paypalId: number;
}
