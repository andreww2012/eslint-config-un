import {definePluginMetadata} from './shared';

export default definePluginMetadata('qunit', {
  configs: ['qunit'],
  docsUrl: 'https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-arrow-tests': {disableInCodeBlocks: 'runtimeOnly'},
    'no-assert-ok': {disableInCodeBlocks: 'tooStrict'},
    'no-async-in-loops': {disableInCodeBlocks: 'tooStrict'},
    'no-commented-tests': {disableInCodeBlocks: 'alternatives'},
    'no-early-return': {disableInCodeBlocks: 'tooStrict'},
    'no-global-module-test': {disableInCodeBlocks: 'imports'},
    'no-identical-names': {disableInCodeBlocks: 'alternatives'},
    'no-loose-assertions': {disableInCodeBlocks: 'tooStrict'},
    'require-expect': {disableInCodeBlocks: 'tooStrict'},
  },
});
