import {
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  HasOne,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Company } from './Company';
import { User } from './User';

@Table
export class Experience extends BaseEntity {
  @PrimaryKey
  @ForeignKey(() => User)
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
    type: DataType.STRING,
  })
  dateStart: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  dateEnd: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  description: string;

  @HasOne(() => Company, 'id')
  company: Company;

  @BelongsTo(() => User, {
    foreignKey: 'accountId',
  })
  user: User;
}
