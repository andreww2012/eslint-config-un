import {definePluginMetadata} from './shared';

export default definePluginMetadata('eslint-plugin', {
  configs: ['eslintPlugin'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'meta-property-ordering': {stylistic: true},
    'no-property-in-node': {disableInCodeBlocks: 'typeAware'},
    'test-case-property-ordering': {stylistic: true},
  },
});
