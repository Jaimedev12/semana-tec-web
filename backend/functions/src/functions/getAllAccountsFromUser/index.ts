import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {withAuth} from "../../utils/authWrapper";

const getAllAccountsFromUser = withAuth(async (data, context) => {
    const userId = context.auth?.uid || "test-user-id";
    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const accounts = await accountService.query([{field: "userId", operator: "==", value: userId}]);
    return accounts;
});

export default getAllAccountsFromUser;
