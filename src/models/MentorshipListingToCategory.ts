import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MentorshipListing } from './MentorshipListing';
import { Category } from './Category';

@Table({
  tableName: 'MListingToCategory', // without it, MySQL throws key too long error
})
export class MentorshipListingToCategory extends Model<MentorshipListingToCategory> {
  @ForeignKey(() => MentorshipListing)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  categoryId: string;
}
