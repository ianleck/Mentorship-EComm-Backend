import {
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

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: DataType.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    type: DataType.STRING,
    defaultValue: DataType.STRING,
  })
  description: string;

  @BelongsToMany(() => MentorshipListing, {
    through: () => ListingToCategory,
    foreignKey: 'categoryId',
  })
  MentorshipListings: MentorshipListing[];
}
