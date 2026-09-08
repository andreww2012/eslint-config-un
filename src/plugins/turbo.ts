import {definePluginMetadata} from './shared';

export default definePluginMetadata('turbo', {
  configs: ['turbo'],
  docsUrl: 'https://turborepo.dev/docs/reference/eslint-plugin-turbo',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/${ruleName}.md`,
  rules: {
    'no-undeclared-env-vars': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
