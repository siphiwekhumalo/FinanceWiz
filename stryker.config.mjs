/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'jest',
  testRunnerNodeArgs: ['--loader=ts-node/esm'],
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.mjs',
    enableFindRelatedTests: true,
  },
  mutate: [
    'client/src/**/*.ts',
    'client/src/**/*.tsx',
    'server/**/*.ts',
    'shared/**/*.ts',
    '!client/src/**/*.test.ts',
    '!client/src/**/*.test.tsx',
    '!client/src/**/*.spec.ts',
    '!client/src/**/*.spec.tsx',
    '!server/**/*.test.ts',
    '!server/**/*.spec.ts',
    '!client/src/setupTests.ts',
    '!client/src/main.tsx',
    '!**/*.d.ts',
  ],
  thresholds: {
    high: 80,
    low: 70,
    break: 60,
  },
  timeoutMS: 60000,
  timeoutFactor: 1.5,
  maxConcurrentTestRunners: 4,
  tempDirName: 'stryker-tmp',
  cleanTempDir: true,
  htmlReporter: {
    fileName: 'stryker-reports/mutation-report.html',
  },
  dashboard: {
    reportType: 'full',
  },
  plugins: [
    '@stryker-mutator/jest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter',
  ],
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  buildCommand: 'npm run build',
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    'stryker-reports',
    '**/*.test.*',
    '**/*.spec.*',
  ],
};