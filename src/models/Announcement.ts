import {
    BelongsTo,
    Column,
    DataType,
    Default,
    Model,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { Course } from './Course';
  @Table
  export class Announcement extends Model<BaseEntity> {
      @PrimaryKey
      @Default(DataType.UUIDV4)
      @Column(DataType.UUID)
      announcementId: string; 

      @Default('')
      @Column(DataType.STRING)
      title: string; 

      @Default('')
      @Column(DataType.TEXT)
      description: string; 

      @Column(DataType.UUID)
      courseId: string;

  // ==================== RELATIONSHIP MAPPINGS ====================

  @BelongsTo(() => Course, {
    onDelete: 'CASCADE',
    onUpdate: 'no action',
    foreignKey: {
      name: 'courseId',
      allowNull: false,
    },
  })
  Course: Course;
}