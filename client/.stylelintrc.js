module.exports = {
  extends: 'stylelint-config-standard',
  plugins: ['stylelint-scss'],
  rules: {
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
        ignoreAtRules: ['else'],
      },
    ],
    'at-rule-no-unknown': null,
    'block-closing-brace-newline-after': [
      'always',
      {
        ignoreAtRules: ['else', 'if'],
      },
    ],
    'scss/at-rule-no-unknown': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
};
