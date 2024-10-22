import {jest} from "@jest/globals";

jest.mock("../firebase", () => {
    const mockFirestore = {
        collection: jest.fn(),
    };

    const mockAuth = {
        createUser: jest.fn(),
        verifyIdToken: jest.fn(),
    };

    return {
        app: {
            firestore: jest.fn(() => mockFirestore),
            auth: jest.fn(() => mockAuth),
        },
        firestore: mockFirestore,
        auth: mockAuth,
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});
