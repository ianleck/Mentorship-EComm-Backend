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
import { User } from './User';

@Table
export class UserToCategories extends Model<UserToCategories> {
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  accountId: string;

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
