import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { MentorshipListing } from './MentorshipListing';

@Table
export class Category extends BaseEntity {
  @Column({ field: 'category_id', type: DataType.UUID, primaryKey: true })
  categoryId: number;

  @Column({ field: 'name', type: DataType.STRING })
  name: string;

  @Column({ field: 'description', type: DataType.STRING })
  description: string;
}

Category.belongsToMany(MentorshipListing, { through: 'categoryId' });
