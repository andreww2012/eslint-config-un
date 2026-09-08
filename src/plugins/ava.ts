import {definePluginMetadata} from './shared';

export default definePluginMetadata('ava', {
  configs: ['ava'],
  docsUrl: 'https://github.com/avajs/eslint-plugin-ava/blob/HEAD/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'hooks-order': {stylistic: true},
    'no-negated-assertion': {stylistic: true},
    'prefer-t-throws': {stylistic: true},
  },
});
