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
export class Testimonial extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  testimonialId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string; // studentId

  @AllowNull(false)
  @Column(DataType.TEXT)
  body: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;
}

//Block - Cannot view profile at all
//Can block anyone
