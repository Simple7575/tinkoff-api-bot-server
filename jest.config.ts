import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/**/*.test.ts"],
    verbose: true,
    forceExit: true,
    // clearMocks: true,
    // resetMocks: true,
    // restoreMocks: true,
    resolver: "jest-ts-webcompat-resolver",
};

export default config;
