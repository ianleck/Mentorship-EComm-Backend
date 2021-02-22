import { BelongsToMany, Column, DataType, Table } from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipCategory } from './MentorshipCategory';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Category extends BaseEntity {
  @Column({ field: 'category_id', type: DataType.UUID, primaryKey: true })
  categoryId: number;

  @Column({ field: 'name', type: DataType.STRING })
  name: string;

  @Column({ field: 'description', type: DataType.STRING })
  description: string;

  @BelongsToMany(() => MentorshipListing, () => MentorshipCategory)
  mentorshipListings: MentorshipListing[];
}
