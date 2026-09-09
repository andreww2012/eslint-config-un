import {definePluginMetadata} from './shared';

export default definePluginMetadata('tanstack-query', {
  configs: ['tanstackQuery'],
  docsUrl: 'https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query',
  ruleDocsUrl: (ruleName) => `https://tanstack.com/query/latest/docs/eslint/${ruleName}`,
  gitTag: (version) => `@tanstack/eslint-plugin-query@${version}`,
  suggestedPrefix: ['@tanstack/query', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'no-rest-destructuring': {requiresTypeInfo: 'optional'},
  },
});
