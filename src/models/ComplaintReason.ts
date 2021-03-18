import {
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Complaint } from './Complaint';

@Table
export class ComplaintReason extends Model<ComplaintReason> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  complaintReasonId: string;

  @Column(DataType.STRING)
  reason: string;

  @Column(DataType.TEXT)
  description: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @HasMany(() => Complaint, 'complaintReasonId')
  Complains: Complaint[];
}
