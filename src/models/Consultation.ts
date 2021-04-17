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
import { MentorshipListing } from './MentorshipListing';
import { User } from './User';

@Table
export class Consultation extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  consultationId: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  title: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  senseiId: string;

  @Column(DataType.UUID)
  studentId: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  timeStart: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  timeEnd: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;

  @BelongsTo(() => User, { foreignKey: 'senseiId', targetKey: 'accountId' })
  Sensei: User;

  @BelongsTo(() => User, { foreignKey: 'studentId', targetKey: 'accountId' })
  Student: User;
}
