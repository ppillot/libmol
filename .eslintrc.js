module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/attribute-hyphenation': 'warning',
    'vue/html-closing-bracket-newline': 'warning',
    'vue/html-quotes': 'error',
    'vue/multiline-html-element-content-newline': 'warning',
    'vue/mustache-interpolation-spacing': 'error',
    'vue/name-property-casing': 'error',
    'vue/no-spaces-around-equal-signs-in-attribute': 'error',
    'vue/no-template-shadow': 'error',
    'vue/prop-name-casing': 'error',
    'vue/require-default-prop': 'warning',
    'vue/require-prop-types': 'warning',
    'vue/no-v-html': 'warning',
    'vue/this-in-template': 'warning',
    'vue/camelcase': 'error'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser'
  }
}
