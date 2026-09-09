import {definePluginMetadata} from './shared';

export default definePluginMetadata('math', {
  configs: ['math'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-math',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-math/rules/${ruleName}.html`,
  rules: {
    abs: {requiresTypeInfo: 'optional'},
    'prefer-exponentiation-operator': {stylistic: true},
    'prefer-math-sum-precise': {requiresTypeInfo: 'optional'},
    'prefer-number-is-finite': {requiresTypeInfo: 'optional'},
    'prefer-number-is-nan': {requiresTypeInfo: 'optional'},
  },
});
