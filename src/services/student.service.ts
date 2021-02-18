import { Student } from '../models/Student';
import { ERRORS } from '../constants/errors';
import { STATUS_ENUM_OPTIONS } from '../constants/enum';

export default class StudentService {
  // public static async createStudent(newStudent) {
  //     const student = new Student()
  // }

  public static async updateStudent(accountId: string, studentDto) {
    const student = await Student.findByPk(accountId);
    if (student) {
      await student.update({
        firstName: studentDto.firstName,
        lastName: studentDto.lastName,
        contactNumber: studentDto.contactNumber,
      });
    } else {
      throw new Error(ERRORS.STUDENT_DOES_NOT_EXIST);
    }
  }
}
