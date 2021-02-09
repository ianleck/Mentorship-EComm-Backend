import {BelongsToMany, Table} from 'sequelize-typescript';
import {User} from "./User";
import {Sensei} from "./Sensei";
import {StudentSensei} from "./StudentSensei";

@Table
export class Student extends User {

    @BelongsToMany(() => Sensei, () => StudentSensei)
    following: Sensei[];

    // @HasMany(() => CourseContract)
    // courses: CourseContract;
    //
    // @HasMany(() => MentorshipContract)
    // mentorships: MentorshipContract;
}