import { Column, DataType, Table, BelongsToMany } from 'sequelize-typescript';
import { Account } from './abstract/Account';
import {
  STATUS_ENUM,
  STATUS_ENUM_OPTIONS,
  USER_TYPE_ENUM,
  USER_TYPE_ENUM_OPTIONS,
} from '../constants/enum';
import { UserFollowership } from './UserFollowership';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constants/constants';

@Table
export class User extends Account {
  @Column({ field: 'username', type: DataType.STRING, unique: true })
  username: string;

  @Column({ field: 'password', type: DataType.STRING })
  password: string;

  @Column({ field: 'first_name', type: DataType.STRING })
  firstName: string;

  @Column({ field: 'last_name', type: DataType.STRING })
  lastName: string;

  @Column({
    field: 'email_verified',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({ field: 'email', type: DataType.STRING, unique: true })
  email: string;

  @Column({ field: 'contact_number', type: DataType.STRING })
  contactNumber: string;

  @Column({
    field: 'status',
    type: DataType.ENUM(...Object.values(STATUS_ENUM_OPTIONS)),
    defaultValue: STATUS_ENUM_OPTIONS.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({
    field: 'user_type',
    type: DataType.ENUM(...Object.values(USER_TYPE_ENUM_OPTIONS)),
  })
  userType: USER_TYPE_ENUM;
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
    field: 'admin_verified',
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  adminVerified: boolean;

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
