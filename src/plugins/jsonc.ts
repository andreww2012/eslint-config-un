import {definePluginMetadata} from './shared';

export default definePluginMetadata('jsonc', {
  configs: ['jsonc'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-jsonc',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-jsonc/rules/${ruleName}.html`,
  prettierLanguage: 'json',
  rules: {
    'array-bracket-newline': {stylistic: true, prettierIncompatible: true},
    'array-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    'array-element-newline': {stylistic: true, prettierIncompatible: true},
    'comma-dangle': {stylistic: true, prettierIncompatible: true},
    'comma-style': {stylistic: true, prettierIncompatible: true},
    indent: {stylistic: true, prettierIncompatible: true},
    'key-spacing': {stylistic: true, prettierIncompatible: true},
    'no-floating-decimal': {prettierIncompatible: true},
    'object-curly-newline': {stylistic: true, prettierIncompatible: true},
    'object-curly-spacing': {stylistic: true, prettierIncompatible: true},
    'object-property-newline': {stylistic: true, prettierIncompatible: true},
    'quote-props': {stylistic: true, prettierIncompatible: true},
    quotes: {stylistic: true, prettierIncompatible: true},
    'sort-array-values': {stylistic: true},
    'sort-keys': {stylistic: true},
    'space-unary-ops': {prettierIncompatible: true},
  },
});
