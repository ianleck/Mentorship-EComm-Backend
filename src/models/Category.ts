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
import { ListingToCategory } from './ListingToCategory';
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
    through: () => ListingToCategory,
    foreignKey: 'categoryId',
  })
  MentorshipListings: MentorshipListing[];
}
