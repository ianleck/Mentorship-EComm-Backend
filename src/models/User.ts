import jwt from 'jsonwebtoken';
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  HasOne,
  Table,
} from 'sequelize-typescript';
import { JWT_SECRET } from '../constants/constants';
import {
  STATUS_ENUM,
  STATUS_ENUM_OPTIONS,
  USER_TYPE_ENUM,
  USER_TYPE_ENUM_OPTIONS,
  PRIVACY_PERMISSIONS_ENUM,
  PRIVACY_PERMISSIONS_ENUM_OPTIONS,
  ADMIN_VERIFIED_ENUM,
  ADMIN_VERIFIED_ENUM_OPTIONS,
} from '../constants/enum';
import { Account } from './abstract/Account';
import { Company } from './Company';
import { Experience } from './Experience';
import { Occupation } from './Occupation';
import { UserFollowership } from './UserFollowership';
@Table
export class User extends Account {
  @Column({ type: DataType.STRING, unique: true })
  username: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ field: 'first_name', type: DataType.STRING })
  firstName: string;

  @Column({ field: 'last_name', type: DataType.STRING })
  lastName: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({ field: 'email', type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.STRING })
  contactNumber: string;

  @Column({
    type: DataType.ENUM(...Object.values(STATUS_ENUM_OPTIONS)),
    defaultValue: STATUS_ENUM_OPTIONS.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({ type: DataType.ENUM(...Object.values(USER_TYPE_ENUM_OPTIONS)) })
  userType: USER_TYPE_ENUM;

  @Column({ type: DataType.STRING })
  industry: string;

  @HasOne(() => Occupation, 'occupationId')
  occupation: Occupation;

  @HasOne(() => Company, 'companyId')
  company: Company;

  @Column({ type: DataType.BLOB })
  headline: string;

  @Column({ type: DataType.BLOB })
  bio: string;

  @Column({ type: DataType.STRING })
  personality: string;

  @HasMany(() => Experience, 'experienceId')
  experience: Experience[];

  @Column({ type: DataType.BOOLEAN })
  emailNotification: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(PRIVACY_PERMISSIONS_ENUM_OPTIONS)),
    defaultValue: PRIVACY_PERMISSIONS_ENUM_OPTIONS.ALL,
  })
  privacy: PRIVACY_PERMISSIONS_ENUM;

  // @Column
  // achievements: Achievement;
  @BelongsToMany(() => User, () => UserFollowership, 'followerId')
  following: User[];

  @BelongsToMany(() => User, () => UserFollowership, 'followingId')
  followers: User[];

  // @HasMany(() => CourseContract)
  // courses: CourseContract;
  //
  // @HasMany(() => MentorshipContract)
  // mentorships: MentorshipContract;

  // achievements

  @Column({
    type: DataType.ENUM(...Object.values(ADMIN_VERIFIED_ENUM_OPTIONS)),
    defaultValue: ADMIN_VERIFIED_ENUM_OPTIONS.SHELL,
  })
  adminVerified: ADMIN_VERIFIED_ENUM;

  // @HasMany(() => Course)
  // coursesTaught: Course[];
  //
  // @HasMany(() => MentorshipListing)
  // mentorshipListing: MentorshipListing[];
  //
  // @HasMany(() => Post)
  // posts: Post[];
  //
  // @HasOne(() => Wallet)
  // wallet: Wallet;

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
