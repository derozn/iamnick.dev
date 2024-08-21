const ignoreFolders = ['./storybook/', './build/', 'node_modules/'];

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  bail: 10,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'src/**/*.{ts,}',
    '!**/*.d.{ts,}',
    '!**/test.{ts,}',
    '!**/*.test.{ts,}',
    '!src/**/__tests__/**/*',
    '!src/**/__tests__/*',
    '!src/**/__mocks__/*',
    '!src/**/__mocks__/**/*',
  ],
  verbose: true,
  setupFiles: ['<rootDir>/config/jest/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/config/jest/jest.setup.postenv.ts'],
  testPathIgnorePatterns: ignoreFolders,
  transformIgnorePatterns: ignoreFolders,
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '\\.(css|less|scss|sass)$': '<rootDir>/config/jest/stubs/css.js',
  },
  modulePaths: ['<rootDir>'],
  roots: ['<rootDir>/src'],
  testEnvironmentOptions: {
    url: 'http://iamnick.dev',
  },
  testEnvironment: 'jest-environment-jsdom',
  globals: {
    /** @type {import('ts-jest').TsJestGlobalOptions} */
    'ts-jest': {
      isolatedModules: true,
      tsconfig: '<rootDir>/tsconfig.test.json',
      babelConfig: true,
    },
  },
};
