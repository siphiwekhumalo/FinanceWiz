export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  testMatch: [
    '<rootDir>/client/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/client/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/server/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/server/**/*.{test,spec}.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.{ts,tsx}',
    'shared/**/*.{ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/main.tsx',
    '!client/src/index.css',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(lightweight-charts|framer-motion)/)',
  ]
};