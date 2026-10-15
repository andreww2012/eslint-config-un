import {definePluginMetadata} from './shared';

export default definePluginMetadata('testing-library', {
  configs: ['testingLibrary'],
  docsUrl: 'https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'consistent-data-testid': {disableInCodeBlocks: 'tooStrict'},
    'no-container': {disableInCodeBlocks: 'tooStrict'},
    'no-debugging-utils': {disableInCodeBlocks: 'runtimeOnly'},
    'no-dom-import': {disableInCodeBlocks: 'imports'},
    'no-manual-cleanup': {disableInCodeBlocks: 'runtimeOnly'},
    'no-node-access': {disableInCodeBlocks: 'tooStrict'},
    'no-render-in-lifecycle': {disableInCodeBlocks: 'tooStrict'},
    'no-test-id-queries': {disableInCodeBlocks: 'tooStrict'},
    'prefer-query-matchers': {disableInCodeBlocks: 'tooStrict'},
    'prefer-user-event': {disableInCodeBlocks: 'tooStrict'},
    'prefer-user-event-setup': {disableInCodeBlocks: 'tooStrict'},
  },
});
