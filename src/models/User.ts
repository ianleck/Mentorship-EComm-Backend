import {Column, DataType, Table} from 'sequelize-typescript';
import {Account} from "./Account";
import {STATUS_ENUM, STATUS_ENUM_OPTIONS} from "../constants/enum";

@Table
export class User extends Account {

    @Column({field: 'username', type: DataType.STRING})
    username: string;

    @Column({field: 'password', type: DataType.STRING})
    password: string;

    @Column({field: 'first_name', type: DataType.STRING})
    firstName: string;

    @Column({field: 'last_name', type: DataType.STRING})
    lastName: string;

    @Column({field: 'email_verified', type: DataType.BOOLEAN})
    emailVerified: boolean;

    @Column({field: 'email', type: DataType.STRING})
    email: string;

    @Column({field: 'contact_number', type: DataType.STRING})
    contactNumber: string;

    @Column({ field: 'status', type: DataType.ENUM(...STATUS_ENUM_OPTIONS)})
    status: STATUS_ENUM
;

    // @Column
    // achievements: Achievement;
}