import httpStatusCodes from 'http-status-codes';
import { UserService } from "../services/user.service";
import apiResponse from "../utilities/apiResponse";
const passport = require('passport');

export class UserController {
  public static async self(req, res){
    const response = "Hello World";
    const users = await UserService.helloWorld();
    apiResponse.result(res, {message: response, users: users}, httpStatusCodes.OK);
  }

  public static async login(req, res, next) {
    const { username, password } = req.body.user;

    // console.log('username =', username);
    return apiResponse.result(res, { user: 'hi' }, httpStatusCodes.OK);
    // return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    //   // console.log(' antyh =', passportUser)
    //   // console.log(' info =', info)
    //   if(err) {
    //     // console.log(' error =', err)
    //     return next(err);
    //   }
    //
    //   if(passportUser) {
    //     const user = passportUser;
    //     user.token = passportUser.generateJWT();
    //
    //     return apiResponse.result(res, { user: user.toAuthJSON() }, httpStatusCodes.OK);
    //   }
    //
    //   return res.status(400).info;
    // })(req, res, next);
  }
}