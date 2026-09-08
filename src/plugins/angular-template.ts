import {definePluginMetadata} from './shared';

export default definePluginMetadata('angular-template', {
  configs: ['angular'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    '@angular-eslint/template',
    'more concise and convenient to use; `@` feels redundant',
  ],
  rules: {
    'attributes-order': {stylistic: true},
    'prefer-contextual-for-variables': {stylistic: true},
    'prefer-self-closing-tags': {stylistic: true},
    'prefer-style-binding': {stylistic: true},
  },
});
