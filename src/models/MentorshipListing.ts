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
import { VISIBILITY_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Cart } from './Cart';
import { CartToMentorshipListing } from './CartToMentorshipListing';
import { Category } from './Category';
import { MentorshipContract } from './MentorshipContract';
import { MentorshipListingToCategory } from './MentorshipListingToCategory';
import { User } from './User';
@Table
export class MentorshipListing extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  mentorshipListingId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Min(1)
  @Max(10)
  @Default('5.0') //Pend change - arbitrary value
  @Column(DataType.FLOAT)
  rating: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  priceAmount: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(VISIBILITY_ENUM),
    defaultValue: VISIBILITY_ENUM.HIDDEN,
  })
  visibility: VISIBILITY_ENUM;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  @BelongsToMany(() => Category, {
    through: () => MentorshipListingToCategory,
    foreignKey: 'mentorshipListingId',
  })
  Categories: Category[];

  @HasMany(() => MentorshipContract, 'mentorshipListingId')
  MentorshipContracts: MentorshipContract[];

  @BelongsToMany(() => Cart, {
    through: () => CartToMentorshipListing,
    foreignKey: 'mentorshipListingId',
  })
  Carts: Cart[];
}

// MentorshipListing.hasMany(Review, { foreignKey: 'reviewId' })
