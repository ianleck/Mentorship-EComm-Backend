import {
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

  @Column({
    allowNull: false,
    type: DataType.UUID,
  })
  accountId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: DataType.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: DataType.STRING,
  })
  description: string;

  @Min(1)
  @Max(10)
  @Column({
    type: DataType.FLOAT,
    defaultValue: '10.0',
  })
  rating: number;

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
