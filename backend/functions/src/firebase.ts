import * as admin from "firebase-admin";
import "dotenv/config";

const accountParams = {
    type: process.env.PROJECT_TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_x509_cert_url: process.env.CLIENT_CERT,
    universe_domain: process.env.UNIVERSE_DOMAIN,
};

const appConfig = {
    credential: admin.credential.cert(accountParams as admin.ServiceAccount),
};

const app = admin.initializeApp(appConfig, process.env.PROJECT_ID);
const firestore = app.firestore();
const auth = app.auth();

export {
    app,
    firestore,
    auth,
};
