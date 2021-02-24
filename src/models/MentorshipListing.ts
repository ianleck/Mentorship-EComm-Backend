import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  Max,
  Min,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Category } from './Category';
import { ListingToCategory } from './ListingToCategory';
import { User } from './User';

@Table
export class MentorshipListing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @Column({
    allowNull: false,
  })
  senseiId: string;

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
    defaultValue: DataType.FLOAT,
  })
  rating: number;

  @BelongsTo(() => User, 'accountId')
  sensei: User;

  @BelongsToMany(() => Category, {
    through: () => ListingToCategory,
    foreignKey: 'mentorshipListingId',
  })
  Categories: Category[];
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })