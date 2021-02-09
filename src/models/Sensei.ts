import {BelongsToMany, Column, DataType, Table} from 'sequelize-typescript';
import {User} from "./User";
import {Student} from "./Student";
import {StudentSensei} from "./StudentSensei";

@Table
export class Sensei extends User {

    @Column({field: 'admin_verified', type: DataType.BOOLEAN})
    adminVerified: boolean;

    @BelongsToMany(() => Student, () => StudentSensei)
    followers: Student[]

    // @HasMany(() => Course)
    // coursesTaught: Course[];
    //
    // @HasMany(() => MentorshipListing)
    // mentorshipListing: MentorshipListing[];
    //
    // @HasMany(() => MentorshipContract)
    // mentorshipContracts: MentorshipContract[];
    //
    // @HasMany(() => Post)
    // posts: Post[];
    //
    // @HasMany(() => Announcement)
    // announcements: Announcement[];
    //
    // @HasOne(() => Wallet)
    // wallet: Wallet;

}