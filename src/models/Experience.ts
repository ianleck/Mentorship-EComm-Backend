import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from './User';

@Table
export class Experience extends Model<Experience> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  experienceId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  role: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  dateStart: Date;

  @Column(DataType.DATE)
  dateEnd: Date;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  companyName: string;

  @Column(DataType.TEXT)
  companyUrl: string;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsTo(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'no action',
    foreignKey: {
      name: 'accountId',
      allowNull: false,
    },
  })
  user: User;
}
