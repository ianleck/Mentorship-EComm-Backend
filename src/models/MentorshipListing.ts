import {
  BelongsTo,
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
import { Sensei } from './Sensei';

export interface MentorshipListingInterface {
  name: string;
  sensei: Sensei;
  categories: Category[];
  description: string;
  // reviews?: string; // Should be Review object but this will be changed later
  rating?: number;
}

export interface AddMentorshipListingInterface {
  name: string;
  senseiId: string;
  categories: string[];
  description: string;
  // reviews?: string; // Should be Review object but this will be changed later
  rating?: number;
}

@Table
export class MentorshipListing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    allowNull: false,
  })
  senseiId: string;

  @Column({
    allowNull: false,
  })
  categoryId: string;

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

  @BelongsTo(() => Sensei, 'senseiId')
  sensei: Sensei;

  @HasMany(() => Category, 'categoryId')
  categories: Category[];

  @Min(1)
  @Max(10)
  @Column({
    type: DataType.FLOAT,
    defaultValue: DataType.FLOAT,
  })
  rating: number;
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })
