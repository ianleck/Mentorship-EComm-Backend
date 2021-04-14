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
import { User } from './User';
import { UserToAchievement } from './UserToAchievement';

@Table
export class Achievement extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  achievementId: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  title: string;

  @Column(DataType.TEXT)
  description: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsToMany(() => User, {
    through: () => UserToAchievement,
    foreignKey: 'achievementId',
  })
  Users: User[];
}
