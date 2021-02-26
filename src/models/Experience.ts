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
import { Company } from './Company';
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

  @HasOne(() => Company, 'id')
  company: Company;

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
