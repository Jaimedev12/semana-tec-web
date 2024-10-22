module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json"],
        sourceType: "module",
    },
    ignorePatterns: [
        "/lib/**/*", // Ignore built files.
        "/generated/**/*", // Ignore generated files.
    ],
    plugins: [
        "@typescript-eslint",
        "import",
    ],
    rules: {
        "quotes": ["error", "double"],
        "import/no-unresolved": 0,
        "indent": ["error", 4],
        "new-cap": "off",
        "linebreak-style": ["error", "windows"],
        "max-len": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "require-jsdoc": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-var-requires": "off",
    },
    overrides: [
        {
            files: [".eslintrc.js"],
            parser: "espree",
            parserOptions: {
                ecmaVersion: 2020,
            },
        },
    ],
};