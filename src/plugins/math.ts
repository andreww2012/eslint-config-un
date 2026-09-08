import {definePluginMetadata} from './shared';

export default definePluginMetadata('math', {
  configs: ['math'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-math',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-math/rules/${ruleName}.html`,
  rules: {
    'prefer-exponentiation-operator': {stylistic: true},
  },
});
