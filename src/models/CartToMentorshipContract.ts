import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Cart } from './Cart';
import { MentorshipContract } from './MentorshipContract';

@Table
export class CartToMentorshipContract extends Model<CartToMentorshipContract> {
  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId: string;

  @ForeignKey(() => MentorshipContract)
  @Column(DataType.UUID)
  mentorshipContractId: string;
}
