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
import { Course } from './Course';

@Table
export class CourseListingToCategory extends Model<CourseListingToCategory> {
  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId: string;

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
