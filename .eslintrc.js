module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    "no-console": "off"
  },
  overrides: [{
    files: [
      '.template-lintrc.js',
      'testem.js',
      'ember-cli-build.js',
      'config/**/*.js',
      'lib/*/index.js'
    ],
    parserOptions: {
      sourceType: 'script',
      ecmaVersion: 2015
    },
    env: {
      browser: false,
      node: true
    }
  }]
};
