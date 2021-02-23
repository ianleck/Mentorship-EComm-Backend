import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

export abstract class BaseEntity extends Model<BaseEntity> {
  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
  timestamps = true;
  paranoid = true;
}
