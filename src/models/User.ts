import jwt from 'jsonwebtoken';
import {
  BelongsTo,
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
  USER_TYPE_ENUM,
  PRIVACY_PERMISSIONS_ENUM,
  ADMIN_VERIFIED_ENUM,
} from '../constants/enum';
import { Account } from './abstract/Account';
import { Experience } from './Experience';
import { MentorshipContract } from './MentorshipContract';
import { UserFollowership } from './UserFollowership';
@Table
export class User extends Account {
  // ==================== PERSONAL INFORMATION ====================
  @Column({ type: DataType.STRING, unique: true })
  username: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ field: 'first_name', type: DataType.STRING })
  firstName: string;

  @Column({ field: 'last_name', type: DataType.STRING })
  lastName: string;

  @Column({ field: 'email', type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.STRING })
  contactNumber: string;

  // ==================== ACCOUNT STATUS ====================
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(STATUS_ENUM),
    defaultValue: STATUS_ENUM.ACTIVE,
  })
  status: STATUS_ENUM;

  @Column({ type: DataType.ENUM, values: Object.values(USER_TYPE_ENUM) })
  userType: USER_TYPE_ENUM;

  // ==================== PROFILE INFORMATION ====================
  @Column({ type: DataType.STRING })
  industry: string;

  @Column({ type: DataType.STRING })
  headline: string;

  @Column({ type: DataType.TEXT })
  bio: string;

  @Column({ type: DataType.STRING })
  personality: string;

  @Column({ type: DataType.STRING })
  occupation: string;

  // ==================== ACCOUNT SETTINGS ====================
  @Column({ type: DataType.BOOLEAN })
  emailNotification: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(PRIVACY_PERMISSIONS_ENUM),
    defaultValue: PRIVACY_PERMISSIONS_ENUM.ALL,
  })
  privacy: PRIVACY_PERMISSIONS_ENUM;
  // ==================== RELATIONSHIP MAPPINGS ====================

  @HasMany(() => Experience, 'accountId')
  Experience: Experience[];

  @BelongsToMany(() => User, () => UserFollowership, 'followerId')
  Following: User[];

  @BelongsToMany(() => User, () => UserFollowership, 'followingId')
  Followers: User[];

  @HasMany(() => MentorshipContract, 'accountId')
  MentorshipContracts: MentorshipContract[];
  // @Column
  // achievements: Achievement;

  // @HasMany(() => CourseContract)
  // courses: CourseContract;
  //

  // achievements

  @Column({
    type: DataType.ENUM,
    values: Object.values(ADMIN_VERIFIED_ENUM),
    defaultValue: ADMIN_VERIFIED_ENUM.SHELL,
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

  // ==================== USER FUNCTIONS ====================
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
