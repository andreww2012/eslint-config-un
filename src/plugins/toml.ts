import {definePluginMetadata} from './shared';

export default definePluginMetadata('toml', {
  configs: ['toml'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-toml',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-toml/rules/${ruleName}.html`,
  prettierLanguage: 'toml',
  rules: {
    'array-bracket-newline': {stylistic: true, prettierIncompatible: true},
    'array-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    'array-element-newline': {stylistic: true, prettierIncompatible: true},
    'comma-style': {stylistic: true, prettierIncompatible: true},
    indent: {stylistic: true, prettierIncompatible: true},
    'inline-table-curly-newline': {stylistic: true, prettierIncompatible: true},
    'inline-table-curly-spacing': {stylistic: true, prettierIncompatible: true},
    'inline-table-key-value-newline': {stylistic: true, prettierIncompatible: true},
    'key-spacing': {stylistic: true, prettierIncompatible: true},
    'no-space-dots': {stylistic: true, prettierIncompatible: true},
    'no-unreadable-number-separator': {stylistic: true},
    'padding-line-between-pairs': {stylistic: true},
    'padding-line-between-tables': {stylistic: true},
    'quoted-keys': {stylistic: true},
    'space-eq-sign': {prettierIncompatible: true},
    'spaced-comment': {stylistic: true},
    'table-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    'tables-order': {stylistic: true},
  },
});
