import {definePluginMetadata} from './shared';

export default definePluginMetadata('promise', {
  configs: ['promise'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'catch-or-return': {disableInCodeBlocks: 'tooStrict'},
    'param-names': {stylistic: true},
  },
});
