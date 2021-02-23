import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MentorshipListing } from './MentorshipListing';
import { Category } from './Category';

@Table
export class ListingToCategory extends Model<ListingToCategory> {
  @ForeignKey(() => MentorshipListing)
  @Column
  mentorshipListingId: string;

  @ForeignKey(() => Category)
  @Column
  categoryId: string;
}
