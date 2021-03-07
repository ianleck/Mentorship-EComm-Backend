import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { CartToMentorshipContract } from './CartToMentorshipContract';
import { MentorshipContract } from './MentorshipContract';

@Table
export class Cart extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  cartId: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.UUID)
  studentId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsToMany(() => MentorshipContract, {
    through: () => CartToMentorshipContract,
    foreignKey: 'cartId',
  })
  MentorshipApplications: MentorshipContract[];

  // @BelongsToMany(() => Course, {
  //   through: () => CartToCourse,
  //   foreignKey: 'cartId',
  // })
  // Course: Course[];
}
