import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipContract } from './MentorshipContract';

@Table
export class Note extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  noteId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  mentorshipContractId: string;

  @Default('')
  @Column(DataType.STRING)
  title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => MentorshipContract, 'mentorshipContractId')
  MentorshipContract: MentorshipContract;
}
