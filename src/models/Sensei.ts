import jwt from 'jsonwebtoken';

import { BelongsToMany, Column, DataType, Table } from 'sequelize-typescript';
import { JWT_SECRET } from 'src/constants/constants';
import { User } from './abstract/User';
import { Student } from './Student';
import { StudentSensei } from './StudentSensei';
@Table
export class Sensei extends User {
  @Column({
    field: 'admin_verified',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  adminVerified: boolean;

  @BelongsToMany(() => Student, () => StudentSensei)
  followers: Student[];

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
