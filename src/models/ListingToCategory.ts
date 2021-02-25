import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MentorshipListing } from './MentorshipListing';
import { Category } from './Category';

@Table
export class ListingToCategory extends Model<ListingToCategory> {
  @ForeignKey(() => MentorshipListing)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  categoryId: string;
}
