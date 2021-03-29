import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @HasMany(() => Complaint, 'complaintReasonId')
  Complains: Complaint[];
}
