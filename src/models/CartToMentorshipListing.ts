import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Min,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Cart } from './Cart';
import { MentorshipListing } from './MentorshipListing';

@Table
export class CartToMentorshipListing extends Model<CartToMentorshipListing> {
  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId: string;

  @ForeignKey(() => MentorshipListing)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @Min(1)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  numSlots: number;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
