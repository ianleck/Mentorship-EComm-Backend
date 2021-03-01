import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table
export class ResetToken extends Model<ResetToken> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  tokenId: string;

  @Column(DataType.STRING)
  hash: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  accountId: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @Column(DataType.DATE)
  expiredAt: Date;
}
