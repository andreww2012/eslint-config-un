import {definePluginMetadata} from './shared';

export default definePluginMetadata('mocha', {
  configs: ['mocha'],
  docsUrl: 'https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/${ruleName}.md`,
  gitTag: (tag) => `eslint-plugin-mocha@${tag}`,
  rules: {
    'consistent-spacing-between-blocks': {stylistic: true},
    'consistent-structure': {stylistic: true},
    'no-async-in-sync-tests': {requiresTypeInfo: 'optional'},
    'no-conditional-tests': {disableInCodeBlocks: 'tooStrict'},
    'no-exports': {disableInCodeBlocks: 'imports'},
    'no-hooks': {disableInCodeBlocks: 'tooStrict'},
    'no-hooks-for-single-child': {disableInCodeBlocks: 'tooStrict'},
    'no-identical-title': {disableInCodeBlocks: 'alternatives'},
    'no-mocha-arrows': {disableInCodeBlocks: 'runtimeOnly'},
    'no-nested-suites': {disableInCodeBlocks: 'tooStrict'},
    'no-pending-tests': {disableInCodeBlocks: 'emptiness'},
    'no-return-from-async': {disableInCodeBlocks: 'tooStrict'},
    'no-root-hooks': {disableInCodeBlocks: 'tooStrict'},
    'no-setup-in-suite': {disableInCodeBlocks: 'tooStrict'},
    'no-synchronous-tests': {disableInCodeBlocks: 'tooStrict'},
    'no-top-level-tests': {disableInCodeBlocks: 'tooStrict'},
  },
});
