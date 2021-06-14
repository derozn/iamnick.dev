const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('../tsconfig.json');

const moduleNameMapper = {
  'three/examples/jsm/loaders/GLTFLoader': '<rootDir>/test/stubs/GLTFLoader',
  '\\.glsl$': '<rootDir>/test/stubs/GLSL',
  ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  verbose: true,
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.postenv.js'],
  testPathIgnorePatterns: ['./.next/', './node_modules/', './.templates/'],
  transformIgnorePatterns: ['./.next/', './node_modules/', './.templates/'],
  modulePaths: ['<rootDir>'],
  rootDir: '../',
  moduleNameMapper,
  testURL: 'http://iamnick.dev',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
      isolatedModules: true,
    },
  },
};
