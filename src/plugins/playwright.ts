import {definePluginMetadata} from './shared';

export default definePluginMetadata('playwright', {
  configs: ['playwright'],
  docsUrl: 'https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'consistent-spacing-between-blocks': {stylistic: true},
    'no-useless-not': {stylistic: true},
    'prefer-comparison-matcher': {stylistic: true},
    'prefer-equality-matcher': {stylistic: true},
    'prefer-hooks-in-order': {stylistic: true},
    'prefer-hooks-on-top': {stylistic: true},
    'prefer-lowercase-title': {stylistic: true},
    'prefer-to-be': {stylistic: true},
    'prefer-to-contain': {stylistic: true},
    'prefer-to-have-count': {stylistic: true},
    'prefer-to-have-length': {stylistic: true},
  },
});
