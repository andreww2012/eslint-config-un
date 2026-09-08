import {definePluginMetadata} from './shared';

export default definePluginMetadata('clsx', {
  configs: ['clsx'],
  docsUrl: 'https://github.com/temoncher/eslint-plugin-clsx/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/temoncher/eslint-plugin-clsx/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'forbid-array-expressions': {stylistic: true},
    'prefer-logical-over-objects': {stylistic: true},
    'prefer-merged-neighboring-elements': {stylistic: true},
    'prefer-objects-over-logical': {stylistic: true},
  },
});
