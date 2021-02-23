import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { MentorshipListing } from './MentorshipListing';
import { Category } from './Category';

@Table
export class ListingToCategory extends Model {
  @ForeignKey(() => MentorshipListing)
  @Column
  mentorshipListingId: string;

  @ForeignKey(() => Category)
  @Column
  categoryId: string;

  // @BelongsTo(() => MentorshipListing, 'mentorshipListingId')
  // MentorshipListing: MentorshipListing;

  // @BelongsTo(() => Category, 'categoryId')
  // Categories: Category[];
}
