import { User} from "../models/abstract/User";

export class UserRepository {
    public static async getComplexJoins() {
        return User.findAll();
    }
}