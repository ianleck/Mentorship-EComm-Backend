import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  Max,
  Min,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Category } from './Category';
import { ListingToCategory } from './ListingToCategory';
import { MentorshipContract } from './MentorshipContract';
import { User } from './User';

@Table
export class MentorshipListing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Min(1)
  @Max(10)
  @Default('10.0') //Pend change - arbitrary value
  @Column(DataType.FLOAT)
  rating: number;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  @BelongsToMany(() => Category, {
    through: () => ListingToCategory,
    foreignKey: 'mentorshipListingId',
  })
  Categories: Category[];

  @HasMany(() => MentorshipContract, 'mentorshipListingId')
  MentorshipContracts: MentorshipContract[];
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })
