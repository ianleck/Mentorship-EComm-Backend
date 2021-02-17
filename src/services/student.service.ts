import { Student } from '../models/Student';
import { ERRORS } from '../constants/errors';

export default class StudentService {
  public static async updateStudent(studentDto) {
    const student = await Student.findByPk(studentDto.accountId);
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
