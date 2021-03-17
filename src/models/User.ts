import jwt from 'jsonwebtoken';
import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Table,
  Unique,
} from 'sequelize-typescript';
import { JWT_SECRET } from '../constants/constants';
import {
  ADMIN_VERIFIED_ENUM,
  PRIVACY_PERMISSIONS_ENUM,
  STATUS_ENUM,
  USER_TYPE_ENUM,
} from '../constants/enum';
import { Account } from './abstract/Account';
import { Experience } from './Experience';
import { LikePost } from './LikePost';
import { MentorshipContract } from './MentorshipContract';
import { Post } from './Post';
import { Testimonial } from './Testimonial';
import { UserFollowership } from './UserFollowership';
import { Wallet } from './Wallet';
@Table
export class User extends Account {
  // ==================== PERSONAL INFORMATION ====================
  @Unique
  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  firstName: string;

  @Column(DataType.STRING)
  lastName: string;

  @Unique
  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  contactNumber: string;

  // ==================== ACCOUNT STATUS ====================
  @Default(false)
  @Column(DataType.BOOLEAN)
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
  @Column(DataType.STRING)
  industry: string;

  @Column(DataType.STRING)
  headline: string;

  @Column(DataType.TEXT)
  bio: string;

  @Column(DataType.STRING)
  personality: string;

  @Column(DataType.STRING)
  occupation: string;

  @Column(DataType.STRING)
  transcriptUrl: string;

  @Column(DataType.STRING)
  profileImgUrl: string;

  @Column(DataType.STRING)
  cvUrl: string;
  // ==================== ACCOUNT SETTINGS ====================
  @Column(DataType.BOOLEAN)
  emailNotification: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(PRIVACY_PERMISSIONS_ENUM),
    defaultValue: PRIVACY_PERMISSIONS_ENUM.ALL,
  })
  chatPrivacy: PRIVACY_PERMISSIONS_ENUM;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isPrivateProfile: boolean;

  @Column({
    type: DataType.ENUM,
    values: Object.values(ADMIN_VERIFIED_ENUM),
    defaultValue: ADMIN_VERIFIED_ENUM.SHELL,
  })
  adminVerified: ADMIN_VERIFIED_ENUM;

  // ==================== PAYMENT SETTINGS ====================
  @Unique
  @Column(DataType.STRING)
  walletId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @HasMany(() => Experience, 'accountId')
  Experience: Experience[];

  @BelongsToMany(() => User, () => UserFollowership, 'followerId')
  Following: User[];

  @BelongsToMany(() => User, () => UserFollowership, 'followingId')
  Followers: User[];

  @HasMany(() => MentorshipContract, 'accountId')
  MentorshipContracts: MentorshipContract[];

  @HasOne(() => Wallet, 'accountId')
  Wallet: Wallet;

  @HasMany(() => Post, 'accountId')
  Posts: Post[]; 

  //@HasMany(() => Testimonial, 'testimonialId')
  //Testimonials: Testimonial[];

  // @Column
  // achievements: Achievement;

  // @HasMany(() => CourseContract)
  // courses: CourseContract;
  //

  // achievements

  // @HasMany(() => Course)
  // coursesTaught: Course[];
  //
  // @HasMany(() => MentorshipListing)
  // mentorshipListing: MentorshipListing[];
  //
  // @HasMany(() => Post)
  // posts: Post[];
  //

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
