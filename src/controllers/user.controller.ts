import httpStatusCodes from 'http-status-codes';
import { UserService } from "../services/user.service";
import apiResponse from "../utilities/apiResponse";

export class UserController {
  public static async self(req, res){
    const response = "Hello World";
    const users = await UserService.helloWorld();
    apiResponse.result(res, {message: response, users: users}, httpStatusCodes.OK);
  }
}