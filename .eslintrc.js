/* eslint-disable no-undef */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "indent": ["error", 2],
    "no-trailing-spaces": ["error"],
    "semi": ["error"],
    "comma-dangle": ["error", "only-multiline"],
  },
};
