import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Category } from './Category';
import { MentorshipListing } from './MentorshipListing';

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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
