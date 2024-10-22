import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {withAuth} from "../../utils/authWrapper";
import {Account} from "../../db-models/accounts/schema";

const getAllAccountsFromUser = withAuth(async (data, context) => {
    const userId = context.auth.uid;
    if (!userId) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const accounts: Account[] = await accountService.query([{field: "userId", operator: "==", value: userId}]);
    return accounts;
});

export default getAllAccountsFromUser;
