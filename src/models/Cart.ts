import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { CartToCourse } from './CartToCourse';
import { CartToMentorshipListing } from './CartToMentorshipListing';
import { Course } from './Course';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Cart extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  cartId: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.UUID)
  studentId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsToMany(() => MentorshipListing, {
    through: () => CartToMentorshipListing,
    foreignKey: 'cartId',
  })
  MentorPasses: MentorshipListing[];

  @BelongsToMany(() => Course, {
    through: () => CartToCourse,
    foreignKey: 'cartId',
  })
  Courses: Course[];
}
