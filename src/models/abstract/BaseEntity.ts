import {Column, CreatedAt, Model, Table, UpdatedAt} from 'sequelize-typescript';

export abstract class BaseEntity extends Model<BaseEntity> {

    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;

    @UpdatedAt
    @Column({field: 'updated_at'})
    updatedAt: Date;
}