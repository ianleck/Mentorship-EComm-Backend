import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ACHIEVEMENT_ENUM } from '../constants/enum';
import { Achievement } from './Achievement';
import { User } from './User';

@Table
export class UserToAchievement extends Model<UserToAchievement> {
  @ForeignKey(() => Achievement)
  @Column(DataType.UUID)
  achievementId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  accountId: string;

  @Column(DataType.INTEGER)
  currentCount: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(ACHIEVEMENT_ENUM),
  })
  medal: ACHIEVEMENT_ENUM;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}
