import {
  BelongsTo,
  Column,
  DataType,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Category } from './Category';
import { Sensei } from './Sensei';

@Table
export class MentorshipListing extends BaseEntity {
  @Column({
    field: 'mentorship_listing_id',
    type: DataType.UUID,
    primaryKey: true,
  })
  mentorshipListingId: number;

  @Column({ field: 'description', type: DataType.STRING })
  description: string;

  @HasMany(() => Category, 'categoryId')
  categories: Category[];

  @BelongsTo(() => Sensei, 'senseiId')
  sensei: Sensei;

  @Column({ field: 'rating', type: DataType.INTEGER })
  rating: number;
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })
