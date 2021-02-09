import {Column, DataType, ForeignKey, HasOne, Table} from 'sequelize-typescript';
import {User} from "./User";
import {ADMIN_PERMISSION_ENUM, ADMIN_PERMISSION_ENUM_OPTIONS} from "../constants/enum";

@Table
export class Admin extends User {

    @Column({field: 'permission', type: DataType.ENUM(...ADMIN_PERMISSION_ENUM_OPTIONS)})
    permission: ADMIN_PERMISSION_ENUM;

    @ForeignKey(() => Admin)
    @Column
    accountId: string;

    @HasOne(() => Admin)
    updatedBy: Admin;

    @HasOne(() => Admin)
    createdBy: Admin;

    // @HasMany(() => CourseContract)
    // courses: CourseContract;
    //
    // @HasMany(() => MentorshipContract)
    // mentorships: MentorshipContract;
}