import {
  BelongsTo,
  Column,
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
    allowNull: true,
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
