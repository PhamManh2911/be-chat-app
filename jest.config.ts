import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.spec.ts', '**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/config/(.*)$': '<rootDir>/src/config/$1',
        '^@/routers/(.*)$': '<rootDir>/src/routers/$1',
    },
    setupFilesAfterEnv: [
        '<rootDir>/src/test/setup/seed.ts',
        '<rootDir>/src/test/setup/middleware.ts',
    ],
    clearMocks: true,
};

export default config;
