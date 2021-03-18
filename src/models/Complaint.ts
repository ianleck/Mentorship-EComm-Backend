import {
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { COMPLAINT_TYPE_ENUM } from '../constants/enum';
import { Comment } from './Comment';
import { ComplaintReason } from './ComplaintReason';
import { User } from './User';
@Table
export class Complaint extends Model<Complaint> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  complaintId: string;

  @Column(DataType.UUID)
  accountId: string;

  @Column(DataType.UUID)
  commentId: string;

  @Column(DataType.UUID)
  complaintReasonId: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isResolved: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(COMPLAINT_TYPE_ENUM),
  })
  type: COMPLAINT_TYPE_ENUM;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => ComplaintReason, 'complaintReasonId')
  ComplaintReason: ComplaintReason;

  @BelongsTo(() => User, 'accountId')
  User: User;

  @BelongsTo(() => Comment, 'commentId')
  Comment: Comment;
}
