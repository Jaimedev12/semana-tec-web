import * as admin from "firebase-admin";
import * as test from "firebase-functions-test";
import {addAccount} from "./index";
import accountService from "../../db-models/accounts/service";

jest.mock("../../db-models/accounts/service");

const testEnv = test();

describe("addAccount", () => {
    let wrapped: any;

    beforeAll(() => {
    // Initialize the Firebase admin app
        admin.initializeApp();

        // Wrap the function with the test environment
        wrapped = testEnv.wrap(addAccount);
    });

    afterAll(() => {
        testEnv.cleanup();
    });

    it("should add a new account when valid data is provided", async () => {
        const data = {username: "testuser", password: "testpass"};
        const context = {auth: {uid: "testuid"}};

        (accountService.add as jest.Mock).mockResolvedValue(undefined);

        await expect(wrapped(data, context)).resolves.not.toThrow();

        expect(accountService.add).toHaveBeenCalledWith({
            username: "testuser",
            password: "testpass",
            userId: "testuid",
        });
    });

    it("should throw an error when username is missing", async () => {
        const data = {password: "testpass"};
        const context = {auth: {uid: "testuid"}};

        await expect(wrapped(data, context)).rejects.toThrow("Username and password are required.");
    });

    it("should throw an error when password is missing", async () => {
        const data = {username: "testuser"};
        const context = {auth: {uid: "testuid"}};

        await expect(wrapped(data, context)).rejects.toThrow("Username and password are required.");
    });
});
