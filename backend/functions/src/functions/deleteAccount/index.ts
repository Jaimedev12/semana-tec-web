import * as functions from "firebase-functions/v1";
import accountService from "../../db-models/accounts/service";
import {withAuth} from "../../utils/authWrapper";

const deleteAccount = withAuth(async (data, context) => {
    const {accountId} = data;
    if (!accountId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Account ID is required.",
        );
    }

    // const userId = context.auth?.uid || "tysCxbWsr0flkPOYu0AQdnPv9DC2";
    // console.log("userId", userId);
    // if (!userId) {
    //     throw new functions.https.HttpsError(
    //         "unauthenticated",
    //         "User must be authenticated.",
    //     );
    // }

    // // Verify that the account belongs to the authenticated user
    // const account = await accountService.getById(accountId);
    // if (account.userId !== userId) {
    //     throw new functions.https.HttpsError(
    //         "permission-denied",
    //         "You don't have permission to delete this account.",
    //     );
    // }

    await accountService.delete(accountId);

    return {
        success: true,
    };
});

export default deleteAccount;
