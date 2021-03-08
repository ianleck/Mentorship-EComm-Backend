import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  Unique,
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

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  paypalSubscriptionPlanId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount: number;

  @AllowNull(false)
  @Default(CURRENCY)
  @Column(DataType.STRING)
  currency: string;

  @Column({
    allowNull: false,
    type: DataType.ENUM,
    values: Object.values(INTERVAL_UNIT),
    defaultValue: INTERVAL_UNIT.MONTHLY,
  })
  interval: INTERVAL_UNIT;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, 'accountId')
  Sensei: User;

  // @HasMany(()=> StudentSubscriptions)
}
