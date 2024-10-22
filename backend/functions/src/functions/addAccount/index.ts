import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {Account} from "../../db-models/accounts/schema";
import {withAuth} from "../../utils/authWrapper";

const addAccount = withAuth(async (data, context) => {
    const {username, password} = data;
    if (!username || !password) {
        throw new functions.https.HttpsError("invalid-argument", "Username and password are required.");
    }

    const newAccount: Account = {
        username,
        password,
        userId: context.auth.uid,
    };

    await accountService.add(newAccount);
});

export default addAccount;
