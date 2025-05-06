module.exports = {
  root: true,
  env: {},
  globals: {},
  extends: ['ts-prefixer'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
  },
  plugins: [],
  rules: {},
  settings: {},
  overrides: [
    {
      // Disable the no-unused-vars rule for test files
      files: ['tests/**/*.js', 'utils/**/*.test.js'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
}
