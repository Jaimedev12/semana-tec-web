import FirestoreService from "../../FirestoreService";
import {AccountSchema, Account} from "./schema";

class AccountService extends FirestoreService<Account> {
    constructor() {
        super("accounts", AccountSchema);
    }

    protected throwNotFoundError(): void {
        throw new Error("Account not found");
    }
}

const accountService = new AccountService();

export default accountService;
