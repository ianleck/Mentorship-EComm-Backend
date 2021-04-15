import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Course } from './Course';
import { CourseListingToCategory } from './CourseListingToCategory';
import { MentorshipListing } from './MentorshipListing';
import { MentorshipListingToCategory } from './MentorshipListingToCategory';
import { User } from './User';
import { UserToCategories } from './UserToCategories';

@Table
export class Category extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  categoryId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsToMany(() => MentorshipListing, {
    through: () => MentorshipListingToCategory,
    foreignKey: 'categoryId',
  })
  MentorshipListings: MentorshipListing[];

  @BelongsToMany(() => Course, {
    through: () => CourseListingToCategory,
    foreignKey: 'categoryId',
  })
  Courses: Course[];

  @BelongsToMany(() => User, {
    through: () => UserToCategories,
    foreignKey: 'categoryId',
  })
  UserInterests: User[];
}
