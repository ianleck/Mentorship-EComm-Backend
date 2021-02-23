import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  Max,
  Min,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Category } from './Category';
import { ListingToCategory } from './ListingToCategory';
import { User } from './User';

@Table
export class MentorshipListing extends Model<MentorshipListing> {
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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsTo(() => User, 'accountId')
  sensei: User;

  @BelongsToMany(() => Category, {
    through: () => ListingToCategory,
    foreignKey: 'mentorshipListingId',
  })
  Categories: Category[];
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })
