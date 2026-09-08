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
    'no-unlimited-disable': {disableInCodeBlocks: [false, 'TODO: reason was not recorded']},
  },
});
