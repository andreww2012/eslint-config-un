import {definePluginMetadata} from './shared';

export default definePluginMetadata('json', {
  configs: ['json'],
  docsUrl: 'https://github.com/eslint/json/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://github.com/eslint/json/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `json-v${version}`,
  rules: {
    'no-duplicate-keys': {disableInCodeBlocks: 'alternatives'},
    'sort-keys': {stylistic: true},
  },
});
