import {
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipListingToCategory } from './MentorshipListingToCategory';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Category extends BaseEntity {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  categoryId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;

  // ==================== RELATIONSHIP MAPPINGS ====================
  @BelongsToMany(() => MentorshipListing, {
    through: () => MentorshipListingToCategory,
    foreignKey: 'categoryId',
  })
  MentorshipListings: MentorshipListing[];
}
