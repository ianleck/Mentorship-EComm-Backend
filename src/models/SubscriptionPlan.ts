import {
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CURRENCY } from '../constants/constants';
import { INTERVAL_UNIT } from '../constants/enum';
import { BaseEntity } from './abstract/BaseEntity';
import { User } from './User';

@Table
export class SubscriptionPlan extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  subscriptionId: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataType.STRING,
  })
  paypalSubscriptionPlanId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  amount: number;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: CURRENCY,
  })
  currency: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(INTERVAL_UNIT),
    defaultValue: INTERVAL_UNIT.MONTHLY,
  })
  interval: INTERVAL_UNIT;

  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  // @HasMany(()=> StudentSubscriptions)
}

// SubscriptionPlan.hasMany(Review, { foreignKey: 'reviewId' })
