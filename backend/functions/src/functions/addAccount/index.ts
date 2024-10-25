import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {Account} from "../../db-models/accounts/schema";
import {withAuth} from "../../utils/authWrapper";

const addAccount = withAuth(async (data, context) => {
    const {username, password} = data;
    if (!username || !password) {
        throw new functions.https.HttpsError("invalid-argument", "Username and password are required.");
    }

    console.log("context", context.auth);
    console.log({
        userId: context.auth?.uid || "test-user-id",
        username,
        password,
    });
    console.log("");

    const newAccount: Account = {
        userId: context.auth?.uid || "test-user-id",
        username,
        password,
    };

    const docRef = await accountService.add(newAccount);

    return {
        success: true,
        addedId: docRef.id,
    };
});

export default addAccount;
