import {definePluginMetadata} from './shared';

export default definePluginMetadata('security', {
  configs: ['security'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-security-v${version}`,
  rules: {
    'detect-eval-with-expression': {disableInCodeBlocks: 'eval'},
    'detect-non-literal-fs-filename': {disableInCodeBlocks: 'runtimeOnly'},
    'detect-non-literal-regexp': {disableInCodeBlocks: 'runtimeOnly'},
    'detect-non-literal-require': {disableInCodeBlocks: 'runtimeOnly'},
    'detect-object-injection': {disableInCodeBlocks: 'runtimeOnly'},
    'detect-unsafe-regex': {disableInCodeBlocks: 'performance'},
  },
});
