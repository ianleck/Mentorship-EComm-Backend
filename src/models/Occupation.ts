import {
  Column,
  DataType,
  Default,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { User } from './User';

@Table
export class Occupation extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  occupationId: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: DataType.STRING,
  })
  name: string;
}
