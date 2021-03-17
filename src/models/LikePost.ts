import {
  Column,
  CreatedAt,
  DataType,
  Table,
  UpdatedAt,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';


  
  @Table
  export class LikePost extends BaseEntity {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    likePostId: string;
    
    @AllowNull(false)
    @Column(DataType.UUID)
    accountId: string;
  
    @AllowNull(false)
    @Column(DataType.UUID)
    postId: string;
  
    @CreatedAt
    @Column
    createdAt: Date;
  
    @UpdatedAt
    @Column
    updatedAt: Date;
  }

  