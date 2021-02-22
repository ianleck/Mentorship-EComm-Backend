import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { MentorshipListing } from './MentorshipListing';
import { Category } from './Category';

@Table
export class MentorshipCategory extends Model {
  @ForeignKey(() => MentorshipListing)
  @Column
  mentorshipListingId: number;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;
}
