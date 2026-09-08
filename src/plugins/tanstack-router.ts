import {definePluginMetadata, gitTagUnknown} from './shared';

export default definePluginMetadata('tanstack-router', {
  configs: ['tanstackRouter'],
  docsUrl: 'https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router',
  ruleDocsUrl: (ruleName) => `https://tanstack.com/router/latest/docs/eslint/${ruleName}`,
  gitTag: gitTagUnknown,
  suggestedPrefix: ['@tanstack/router', 'more concise and convenient to use; `@` feels redundant'],
  rules: {},
});
