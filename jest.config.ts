import type { Config } from '@jest/types';

// describes the jest testing configuration for all test files
const config: Config.InitialOptions = {
  verbose: true,
  setupFilesAfterEnv: ['./jest_setup/windowMock.js'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest_setup/fileMock.js',
    '\\.(css|less|scss)$': '<rootDir>/jest_setup/styleMock.js',
  },
  //add
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/charts/HealthChart.test.tsx',
    '/__backend-tests__',
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!d3|internmap|delaunator|robust-predicates|three-forcegraph|three|three-render-objects|3d-force-graph)'
  ],
  // Specify the test path files/patterns to ignore
  
};

export default config;
