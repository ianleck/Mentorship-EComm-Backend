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
import { CURRENCY } from '../constants/constants';
import { VISIBILITY_ENUM } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { Billing } from './Billing';
import { Cart } from './Cart';
import { CartToMentorshipListing } from './CartToMentorshipListing';
import { Category } from './Category';
import { MentorshipContract } from './MentorshipContract';
import { MentorshipListingToCategory } from './MentorshipListingToCategory';
import { Review } from './Review';
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

  @Min(0)
  @Max(5)
  @Default('0.0') //Pend change - arbitrary value
  @Column(DataType.FLOAT)
  rating: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  priceAmount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(VISIBILITY_ENUM),
    defaultValue: VISIBILITY_ENUM.HIDDEN,
  })
  visibility: VISIBILITY_ENUM;

  @Default(null)
  @Column(DataType.DATE)
  publishedAt: Date;

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

  @HasMany(() => Review, 'mentorshipListingId')
  Reviews: Review[];

  @HasMany(() => Billing, 'productId')
  Billings: Billing;
}
