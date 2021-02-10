import {Column, DataType, ForeignKey, HasOne, Table} from 'sequelize-typescript';
import {User} from "./User";
import {ADMIN_PERMISSION_ENUM, ADMIN_PERMISSION_ENUM_OPTIONS} from "../constants/enum";

@Table
export class Admin extends User {

    @ForeignKey(() => Admin)
    @Column({field: 'admin_id', type: DataType.INTEGER, autoIncrement: true, unique: true})
    adminId: number;

    @Column({field: 'permission', type: DataType.ENUM(...ADMIN_PERMISSION_ENUM_OPTIONS)})
    permission: ADMIN_PERMISSION_ENUM;

    @HasOne(() => Admin)
    updatedBy: Admin;

    @HasOne(() => Admin, 'admin_id')
    createdBy: Admin;
}