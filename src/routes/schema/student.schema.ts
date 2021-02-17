import joi from 'joi';
import {STATUS_ENUM_OPTIONS, USER_TYPE_ENUM_OPTIONS} from "../../constants/enum";

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
            status: joi.string().valid(...Object.values(STATUS_ENUM_OPTIONS))
        })
    }),
};
