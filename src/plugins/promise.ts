import {definePluginMetadata} from './shared';

export default definePluginMetadata('promise', {
  configs: ['promise'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'catch-or-return': {disableInCodeBlocks: 'tooStrict'},
    'no-callback-in-promise': {disableInCodeBlocks: 'runtimeOnly'},
    'no-native': {disableInCodeBlocks: 'runtimeOnly'},
    'no-promise-in-callback': {disableInCodeBlocks: 'runtimeOnly'},
    'param-names': {stylistic: true},
    'prefer-catch': {disableInCodeBlocks: 'runtimeOnly'},
    'spec-only': {disableInCodeBlocks: 'runtimeOnly'},
    'valid-params': {disableInCodeBlocks: 'emptiness'},
  },
});
