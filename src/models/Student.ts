import { BelongsToMany, Table } from 'sequelize-typescript';
import { User } from './abstract/User';
import { Sensei } from './Sensei';
import { StudentSensei } from './StudentSensei';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/constants';
@Table
export class Student extends User {
  @BelongsToMany(() => Sensei, () => StudentSensei)
  following: Sensei[];

  // @HasMany(() => CourseContract)
  // courses: CourseContract;
  //
  // @HasMany(() => MentorshipContract)
  // mentorships: MentorshipContract;

  // achievements

  generateJWT() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 1);
    let user: any = Object.assign({}, this.get());
    delete user.password;
    return jwt.sign(
      {
        ...user,
        exp: expirationDate.getTime() / 1000,
      },
      JWT_SECRET
    );
  }

  toAuthJSON() {
    return {
      user: this.toJSON(),
      accessToken: this.generateJWT(),
    };
  }

  toJSON() {
    let user: any = Object.assign({}, this.get());

    delete user.password;
    return user;
  }
}
