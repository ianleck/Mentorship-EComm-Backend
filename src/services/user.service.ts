import { User} from "../models/User";

export class UserService {
    public static async helloWorld() {
        return User.findAll();
    }
}