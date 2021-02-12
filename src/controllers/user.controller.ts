import httpStatusCodes from 'http-status-codes';
import {UserService} from "../services/user.service";
import apiResponse from "../utilities/apiResponse";
import {User} from "../models/abstract/User";
import bcrypt from "bcrypt";
import {Student} from "../models/Student";
import {Sensei} from "../models/Sensei";
import {USER_TYPE_ENUM_OPTIONS} from "../constants/enum";

const uuid = require('uuid');

const passport = require('passport');

export class UserController {
    public static async self(req, res) {
        const response = "Hello World";
        const users = await UserService.helloWorld();
        apiResponse.result(res, {message: response, users: users}, httpStatusCodes.OK);
    }

    public static async login(req, res, next) {
        const {isStudent} = req.body;
        if(isStudent){
            return passport.authenticate('student-local', { session: false }, (err, passportUser, info) => {
                if(err) {
                    return next(err);
                }
                if(passportUser) {
                    const user = passportUser;
                    return apiResponse.result(res, { user: user.toAuthJSON() }, httpStatusCodes.OK);
                }
                return apiResponse.error(res, 400, info);
            })(req, res, next);
        } else {
            return passport.authenticate('sensei-local', { session: false }, (err, passportUser, info) => {
                if(err) {
                    return next(err);
                }
                if(passportUser) {
                    const user = passportUser;
                    return apiResponse.result(res, user.toAuthJSON(), httpStatusCodes.OK);
                }
                return apiResponse.error(res, 400, info);
            })(req, res, next);
        }

        // apiResponse.result(res, {message: response, users: users}, httpStatusCodes.OK);
    }

    public static async register(req, res) {
        const {username, email, password, confirmPassword, isStudent} = req.body;
        let errors = [];

        if (!username || !email || !password || !confirmPassword) {
            errors.push({msg: 'Please enter all fields'});
        }

        if (password != confirmPassword) {
            errors.push({msg: 'Passwords do not match'});
        }

        if (password.length < 8) {
            errors.push({msg: 'Password must be at least 8 characters'});
        }

        if (errors.length > 0) {
            apiResponse.error(res, 400, {message: 'Register Unsuccessful', errors: errors});
            return;
        }

        let user, newUser;

        // check if user exist as a student or sensei
        if(isStudent) {
            user = await Student.findOne({where: {email}});
            newUser = new Student({
                accountId: uuid.v4(),
                username,
                email,
                password,
                userType: USER_TYPE_ENUM_OPTIONS.STUDENT
            });
        } else {
            user = await Sensei.findOne({where: {email}});
            newUser = new Sensei({
                accountId: uuid.v4(),
                username,
                email,
                password,
                userType: USER_TYPE_ENUM_OPTIONS.SENSEI
            });
        }

        // if user exist, return error
        if(user) {
            errors.push({msg: 'Email already exists'});
            apiResponse.error(res, 400, {message: 'Register Unsuccessful', errors: errors});
            return;
        }

        // hash password
        bcrypt.genSalt(10)
            .then((salt) => {
                return bcrypt.hash(newUser.password, salt)
            })
            .then(hash => {
                newUser.password = hash;
                newUser.save();
                apiResponse.result(res, {message: 'Register Successful'}, httpStatusCodes.OK);
            })
            .catch(err => {
                apiResponse.error(res, 400, {message: 'Register Unsuccessful'});
            })

    }
}