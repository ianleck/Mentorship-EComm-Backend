import { User} from "../models/user";

export class UserService {
    public static async helloWorld() {
        return User.findAll();
    }
}