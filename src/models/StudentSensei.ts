import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Student } from './Student';
import { Sensei } from './Sensei';

@Table
export class StudentSensei extends Model {
  @ForeignKey(() => Student)
  @Column
  studentId: number;

  @ForeignKey(() => Sensei)
  @Column
  senseiId: number;
}
