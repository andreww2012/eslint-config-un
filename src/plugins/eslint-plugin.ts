import {definePluginMetadata} from './shared';

export default definePluginMetadata('eslint-plugin', {
  configs: ['eslintPlugin'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'meta-property-ordering': {stylistic: true},
    'no-unused-message-ids': {disableInCodeBlocks: 'unused'},
    'require-meta-default-options': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-docs-description': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-docs-recommended': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-docs-url': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-languages': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-schema': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-schema-description': {disableInCodeBlocks: 'tooStrict'},
    'require-meta-type': {disableInCodeBlocks: 'tooStrict'},
    'require-test-error-positions': {disableInCodeBlocks: 'tooStrict'},
    'test-case-property-ordering': {stylistic: true},
    'unique-test-case-names': {disableInCodeBlocks: 'alternatives'},
  },
});
