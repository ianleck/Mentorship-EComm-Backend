import {
    AllowNull, BelongsTo,
    Column,
    DataType,
    Default,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import { BaseEntity } from './abstract/BaseEntity';
import { User } from './User';
  
  @Table
  export class Post extends BaseEntity {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    postId: string;
  
    @AllowNull(false)
    @Column(DataType.UUID)
    accountId: string;
  
    @Default('')
    @Column(DataType.TEXT)
    content: string;
  
    // ==================== RELATIONSHIP MAPPINGS ====================
    
    @BelongsTo(() => User, 'accountId')
    Sensei: User;

}
  