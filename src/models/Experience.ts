import {
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  HasOne,
  BelongsTo,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { User } from './User';

@Table
export class Experience extends Model<Experience> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  experienceId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  role: string;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  dateStart: Date;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  dateEnd: Date;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  companyName: string;

  @Column({
    allowNull: true,
    type: DataType.TEXT,
  })
  companyUrl: string;

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
