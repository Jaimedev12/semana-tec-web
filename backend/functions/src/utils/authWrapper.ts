import * as functions from "firebase-functions/v1";
import {CallableContext} from "firebase-functions/v1/https";

type AuthenticatedContext = CallableContext & {auth: NonNullable<CallableContext["auth"]>};

export const withAuth = (
    handler: (data: any, context: AuthenticatedContext) => Promise<any>
): functions.HttpsFunction => {
    return functions.https.onCall(async (data: any, context: CallableContext) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "The function must be called while authenticated."
            );
        }
        return handler(data, {...context, auth: context.auth});
    });
};

