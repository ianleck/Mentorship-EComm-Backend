import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  Max,
  Min,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Course } from './Course';
import { MentorshipListing } from './MentorshipListing';
import { User } from './User';

@Table
export class Review extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  reviewId: string;

  @Min(0)
  @Max(5)
  @AllowNull(false)
  @Column(DataType.FLOAT)
  rating: number;

  @Column(DataType.TEXT)
  comment: string;

  @Column(DataType.UUID)
  accountId: string;

  @Column(DataType.UUID)
  courseId: string;

  @Column(DataType.UUID)
  mentorshipListingId: string;
  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  User: User;

  @BelongsTo(() => Course, 'courseId')
  Course: Course;

  @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  MentorshipListing: MentorshipListing;
}
