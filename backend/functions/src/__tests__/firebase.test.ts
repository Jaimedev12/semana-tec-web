import {app, firestore, auth} from "../firebase";
import * as admin from "firebase-admin";

jest.unmock("../firebase");

describe("Firebase initialization", () => {
    it("should initialize the Firebase app", () => {
        expect(app).toBeDefined();
        // expect(app).toBeInstanceOf(admin.app.App);
    });

    it("should initialize Firestore", () => {
        expect(firestore).toBeDefined();
        expect(firestore).toBeInstanceOf(admin.firestore.Firestore);
    });

    it("should initialize Auth", () => {
        expect(auth).toBeDefined();
        // expect(auth).toBeInstanceOf(admin.auth.Auth);
    });

    it("should use the correct project ID", () => {
        expect(app.name).toBe(process.env.PROJECT_ID);
    });

    it("should have valid Firestore collections", async () => {
        const collections = await firestore.listCollections();
        expect(Array.isArray(collections)).toBe(true);
    });

    it("should be able to perform a basic Firestore operation", async () => {
        const testDoc = firestore.collection("test").doc("testDoc");
        await testDoc.set({test: "data"});
        const snapshot = await testDoc.get();
        expect(snapshot.exists).toBe(true);
        expect(snapshot.data()).toEqual({test: "data"});
        await testDoc.delete();
    });

    it("should be able to perform a basic Auth operation", async () => {
        const userRecord = await auth.createUser({
            email: "test@example.com",
            password: "password123",
        });
        expect(userRecord.uid).toBeDefined();
        await auth.deleteUser(userRecord.uid);
    });
});
