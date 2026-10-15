import {definePluginMetadata} from './shared';

export default definePluginMetadata('ava', {
  configs: ['ava'],
  docsUrl: 'https://github.com/avajs/eslint-plugin-ava/blob/HEAD/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'failing-test-url': {disableInCodeBlocks: 'tooStrict'},
    'hooks-order': {stylistic: true},
    'no-async-fn-without-await': {disableInCodeBlocks: 'tooStrict'},
    'no-commented-tests': {disableInCodeBlocks: 'alternatives'},
    'no-duplicate-hooks': {disableInCodeBlocks: 'alternatives'},
    'no-identical-title': {disableInCodeBlocks: 'alternatives'},
    'no-ignored-test-files': {disableInCodeBlocks: 'fileName'},
    'no-import-test-files': {disableInCodeBlocks: 'imports'},
    'no-negated-assertion': {stylistic: true},
    'no-todo-test': {disableInCodeBlocks: 'emptiness'},
    'no-useless-t-pass': {disableInCodeBlocks: 'emptiness'},
    'prefer-power-assert': {disableInCodeBlocks: 'tooStrict'},
    'prefer-t-throws': {stylistic: true},
    'require-assertion': {disableInCodeBlocks: 'emptiness'},
  },
});
