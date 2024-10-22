import FirestoreService from "../../FirestoreService";
import {UserSchema, User} from "./schema";

class UserService extends FirestoreService<User> {
    constructor() {
        super("users", UserSchema);
    }

    protected throwNotFoundError(): void {
        throw new Error("User not found");
    }
}

const userService = new UserService();

export default userService;
