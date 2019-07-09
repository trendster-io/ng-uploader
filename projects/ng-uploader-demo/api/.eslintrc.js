module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all'
      }
    ],
    'consistent-return': 0,
    'no-shadow': 0,
    'no-underscore-dangle': 0,
    'function-paren-newline': 0,
    'import/no-dynamic-require': 0,
    'eqeqeq': 0,
    'camelcase': 0
  }
};
