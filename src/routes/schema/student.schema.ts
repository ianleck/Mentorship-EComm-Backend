import joi from 'joi';
import {
  STATUS_ENUM_OPTIONS,
  USER_TYPE_ENUM_OPTIONS,
} from '../../constants/enum';

interface studentObj {
  accountId: string;
  firstName: string;
  lastName: string;
  contactNumber: number;
}

interface studentProfile {
  studentObj: studentObj;
}

export default {
  // createStudentB: joi.object({
  //     newStudent: joi.object({
  //         username: joi.string().required(),
  //         email: joi.string().required(),
  //         password: joi.string().required(),
  //         confirmPassword: joi.string().required(),
  //         userType: joi.string().valid(...Object.values(USER_TYPE_ENUM_OPTIONS))
  //     })
  // }),
  updateStudentB: joi.object({
    student: joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),

  studentProfile: joi.object({
    student: joi.object({
      accountId: joi.string().required(),
      firstName: joi.string(),
      lastName: joi.string(),
      contactNumber: joi.number(),
    }),
  }),
};
