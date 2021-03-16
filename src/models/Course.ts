import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  Max,
  Min,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CURRENCY, STARTING_BALANCE } from '../constants/constants';
import {
  ADMIN_VERIFIED_ENUM,
  LEVEL_ENUM,
  VISIBILITY_ENUM,
} from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Announcement } from './Announcement';
import { Cart } from './Cart';
import { CartToCourse } from './CartToCourse';
import { Category } from './Category';
import { CourseContract } from './CourseContract';
import { CourseListingToCategory } from './CourseListingToCategory';
import { Lesson } from './Lesson';
import { Review } from './Review';
import { User } from './User';

@Table
export class Course extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  courseId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  subTitle: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TEXT)
  imgUrl: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  language: string;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  priceAmount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @Default(null)
  @Column(DataType.DATE)
  publishedAt: Date;

  @Min(0)
  @Max(5)
  @Default('0.0') //Pend change - arbitrary value
  @Column(DataType.FLOAT)
  rating: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(VISIBILITY_ENUM),
    defaultValue: VISIBILITY_ENUM.HIDDEN,
  })
  visibility: VISIBILITY_ENUM;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(LEVEL_ENUM),
    defaultValue: LEVEL_ENUM.BEGINNER,
  })
  level: LEVEL_ENUM;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(ADMIN_VERIFIED_ENUM),
    defaultValue: ADMIN_VERIFIED_ENUM.DRAFT,
  })
  adminVerified: ADMIN_VERIFIED_ENUM;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  @BelongsToMany(() => Category, {
    through: () => CourseListingToCategory,
    foreignKey: 'courseId',
  })
  Categories: Category[];

  @BelongsToMany(() => Cart, {
    through: () => CartToCourse,
    foreignKey: 'courseId',
  })
  Carts: Cart[];

  @HasMany(() => CourseContract, 'courseId')
  CourseContracts: CourseContract[];

  @HasMany(() => Lesson, 'courseId')
  Lessons: Lesson[];

  @HasMany(() => Announcement, 'courseId')
  Announcements: Announcement[];

  @HasMany(() => Review, 'courseId')
  Reviews: Review[];
}
