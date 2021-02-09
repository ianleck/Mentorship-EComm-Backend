import { User} from "../models/User";

export class UserRepository {
    public static async getComplexJoins() {
        return User.findAll();
    }
}