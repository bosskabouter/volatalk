module.exports = {
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.yml',
      options: {
        singleQuote: false,
      },
    },
  ],
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  semi: true,
};
