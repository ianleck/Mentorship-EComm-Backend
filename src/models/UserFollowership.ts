import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { FOLLOWING_ENUM } from '../constants/enum';
import { User } from './User';

@Table
export class UserFollowership extends Model<UserFollowership> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  followershipId: string;

  @Column(DataType.UUID)
  followerId: string;

  @Column(DataType.UUID)
  followingId: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(FOLLOWING_ENUM),
    defaultValue: FOLLOWING_ENUM.PENDING,
  })
  followingStatus: FOLLOWING_ENUM;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, {
    foreignKey: {
      name: 'followerId',
      allowNull: false,
    },
  })
  Following: User;

  @BelongsTo(() => User, {
    foreignKey: {
      name: 'followingId',
      allowNull: false,
    },
  })
  Follower: User;
}
