import {definePluginMetadata, gitTagUnknown} from './shared';

export default definePluginMetadata('tanstack-start', {
  configs: ['tanstackStart'],
  docsUrl: {label: 'docs (not plugin-specific)', url: 'https://tanstack.com/start/latest'},
  ruleDocsUrl: (ruleName) =>
    `https://github.com/TanStack/router/blob/HEAD/packages/eslint-plugin-start/${ruleName}.md`,
  gitTag: gitTagUnknown,
  suggestedPrefix: ['@tanstack/start', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'no-async-client-component': {requiresTypeInfo: true, disableInCodeBlocks: 'runtimeOnly'},
    'no-client-code-in-server-component': {
      requiresTypeInfo: true,
      disableInCodeBlocks: 'runtimeOnly',
    },
  },
});
