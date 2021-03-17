import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    Default,
    PrimaryKey,
    Table,
  } from 'sequelize-typescript';
  import { BaseEntity } from './abstract/BaseEntity';
  import { MentorshipContract } from './MentorshipContract';
  import { User } from './User';

  
  @Table
  export class Testimonial extends BaseEntity {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    testimonialId: string;
  
    @AllowNull(false)
    @Column(DataType.UUID)
    mentorshipContractId: string; //approved mentorship applications 

    @AllowNull(false)
    @Column(DataType.UUID)
    accountId: string; // mentorId 
  
    @AllowNull(false)
    @Column(DataType.TEXT)
    body: string;
  
  
    // ==================== RELATIONSHIP MAPPINGS ====================
    @BelongsTo(() => User, 'accountId')
    Sensei: User;
  
    @BelongsTo(() => MentorshipContract, 'mentorshipContractId')
    MentorshipContract: MentorshipContract;
  }
  

  