import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {Account} from "../../db-models/accounts/schema";
import {withAuth} from "../../utils/authWrapper";

const editAccount = withAuth(async (data) => {
    const {id, username, password} = data;
    if (!id || (!username && !password)) {
        throw new functions.https.HttpsError("invalid-argument", "Account ID and at least one of username or password are required.");
    }

    const updatedAccount: Partial<Account> = {};
    if (username) {
        updatedAccount.username = username;
    }
    if (password) {
        updatedAccount.password = password;
    }

    await accountService.update(id, updatedAccount);

    return {
        success: true,
    };
});

export default editAccount;
