module.exports = {
  env: {
    node: true,
    es6: true,
    browser: true
  },
  parser: '@babel/eslint-parser',
  extends: [ 'next/core-web-vitals', 'prettier' ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    project: './jsconfig.json',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      experimentalObjectRestSpread: true
    }
  },
  rules: {
    'newline-before-return': 'error',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-filename-extension': [ 1, { extensions: [ '.js', '.jsx' ] } ],
    'react/display-name': 'off',
    '@next/next/no-img-element': 'off',
    'react/no-unescaped-entities': 'off',
    'import/no-anonymous-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'lines-around-comment': [
      'error',
      {
        beforeLineComment: true,
        beforeBlockComment: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowObjectStart: true,
        allowArrayStart: true
      }
    ],

    'import/newline-after-import': [
      'error',
      {
        count: 1
      }
    ],

    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: [ 'export' ], next: [ '*' ] },
      { blankLine: 'always', prev: [ '*' ], next: [ 'multiline-const', 'multiline-let', 'multiline-var', 'export' ] }
    ],
    'comma-dangle': [ 'error', 'never' ],
    'semi': [ 'error', 'always' ],
    'quotes': [ 'error', 'single' ],
    'comma-spacing': [ 'error', { 'before': false, 'after': true } ],
    'space-before-blocks': [ 'error', 'always' ],
    'keyword-spacing': [ 'error', { 'before': true, 'after': true } ],
    'space-infix-ops': [ 'error', { 'int32Hint': false } ],
    'no-unexpected-multiline': 2,
    'object-curly-newline': [ 'error', { consistent: true } ],
    'import/no-import-module-exports': 'off',
    'import/no-relative-packages': 'off',
    'arrow-parens': [ 'error', 'always' ],
    'no-debugger': 2,
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-dupe-class-members': 2,
    'no-dupe-keys': 2,
    'no-empty-function': 2,
    'no-empty-pattern': 2,
    'no-empty': 2,
    'no-eval': 2,
    'no-extra-semi': 2,
    'no-implicit-globals': 2,
    'no-invalid-regexp': 2,
    'no-invalid-this': 2,
    'no-label-var': 2,
    'no-lonely-if': 2,
    'no-mixed-requires': 2,
    'no-multi-str': 2,
    'no-path-concat': 2,
    'no-process-exit': 2,
    'no-restricted-globals': 2,
    'no-tabs': 2,
    'no-trailing-spaces': 2,
    'no-unneeded-ternary': 2,
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-useless-concat': 2,
    'no-useless-constructor': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'prefer-const': 2,
    'prefer-destructuring': 2,
    'prefer-spread': 2,
    'indent': [ 'error', 2, { 'SwitchCase': 1 } ],
    'newline-after-var': [ 'error', 'always' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'key-spacing': [ 'error', { 'afterColon': true } ],
    'line-comment-position': [ 'error', { 'position': 'above' } ],
    'lines-between-class-members': [ 'error', 'always', { 'exceptAfterSingleLine': true } ],
    'no-irregular-whitespace': [ 'error', { 'skipTemplates': true, 'skipRegExps': true, 'skipComments': true } ],
    'object-curly-spacing': [ 'error', 'always', { 'arraysInObjects': true, 'objectsInObjects': true } ],
    'radix': [ 'error', 'as-needed' ]
  }
};
