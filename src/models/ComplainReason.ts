import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Complain } from './Complain';

@Table
export class ComplainReason extends Model<ComplainReason> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  complainReasonId: string;

  @Column(DataType.STRING)
  reason: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.UUID)
  complainId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @HasMany(() => Complain, 'complainReasonId')
  Complains: Complain[];
}
