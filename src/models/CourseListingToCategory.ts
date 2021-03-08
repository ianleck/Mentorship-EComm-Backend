import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Course } from './Course';
import { Category } from './Category';

@Table
export class CourseListingToCategory extends Model<CourseListingToCategory> {
  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  categoryId: string;
}
