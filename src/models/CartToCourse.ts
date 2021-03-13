import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Cart } from './Cart';
import { Course } from './Course';

@Table
export class CartToCourse extends Model<CartToCourse> {
  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId: string;

  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId: string;
}
