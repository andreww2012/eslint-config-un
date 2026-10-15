import {definePluginMetadata} from './shared';

export default definePluginMetadata('eslint-comments', {
  configs: ['eslintComments'],
  docsUrl: 'https://eslint-community.github.io/eslint-plugin-eslint-comments',
  ruleDocsUrl: (ruleName) =>
    `https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/${ruleName}.html`,
  suggestedPrefix: [
    '@eslint-community/eslint-comments',
    'more concise and convenient to use; `@` feels redundant',
  ],
  rules: {
    'disable-enable-pair': {disableInCodeBlocks: 'tooStrict'},
    'no-restricted-disable': {disableInCodeBlocks: 'tooStrict'},
    'no-unlimited-disable': {
      disableInCodeBlocks: [
        false,
        'a snippet can skip linting with an `eslint-skip` comment, which stays out of the rendered code',
      ],
    },
    'no-unused-disable': {disableInCodeBlocks: 'runtimeOnly'},
    'no-use': {disableInCodeBlocks: 'tooStrict'},
    'require-description': {disableInCodeBlocks: 'tooStrict'},
  },
});
