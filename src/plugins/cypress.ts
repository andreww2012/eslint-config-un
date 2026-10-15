import {definePluginMetadata} from './shared';

export default definePluginMetadata('cypress', {
  configs: ['cypress'],
  docsUrl: 'https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'assertion-before-screenshot': {disableInCodeBlocks: 'tooStrict'},
    'no-and': {stylistic: true},
    'no-debug': {disableInCodeBlocks: 'runtimeOnly'},
    'no-force': {disableInCodeBlocks: 'tooStrict'},
    'no-pause': {disableInCodeBlocks: 'runtimeOnly'},
    'require-data-selectors': {disableInCodeBlocks: 'tooStrict'},
    'unsafe-to-chain-command': {requiresTypeInfo: 'optional'},
  },
});
