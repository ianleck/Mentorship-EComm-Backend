import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ListingToCategory } from './ListingToCategory';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Category extends Model<Category> {
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

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;

  @BelongsToMany(() => MentorshipListing, {
    through: () => ListingToCategory,
    foreignKey: 'categoryId',
  })
  MentorshipListings: MentorshipListing[];
}
