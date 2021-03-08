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
import { ADMIN_VERIFIED_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Category } from './Category';
import { CourseContract } from './CourseContract';
import { CourseListingToCategory } from './CourseListingToCategory';
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
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Default(STARTING_BALANCE)
  @Column(DataType.FLOAT)
  priceAmount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  parentCourseId: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.DATE)
  publishedAt: Date;

  @Min(1)
  @Max(10)
  @Default('10.0') //Pend change - arbitrary value
  @Column(DataType.FLOAT)
  rating: number;

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

  @HasMany(() => CourseContract, 'courseId')
  CourseContracts: CourseContract[];
}
