import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
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
}
