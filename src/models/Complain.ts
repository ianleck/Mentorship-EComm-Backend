import {
  BelongsTo,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Comment } from './Comment';
import { ComplainReason } from './ComplainReason';
import { User } from './User';
@Table
export class Complain extends Model<Complain> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  complainId: string;

  @Column(DataType.UUID)
  accountId: string;

  @Column(DataType.UUID)
  complainReasonId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => ComplainReason, 'complainReasonId')
  ComplainReason: ComplainReason;

  @BelongsTo(() => User, 'accountId')
  User: User;

  @BelongsTo(() => Comment, 'commentId')
  Comment: Comment;
}
