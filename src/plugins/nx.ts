import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('nx', {
  configs: ['nx'],
  docsUrl: 'https://nx.dev/docs/technologies/eslint/eslint-plugin',
  ruleDocsUrl: (ruleName) =>
    `https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/${ruleName}`,
  gitTag: gitTagAsVersion,
  suggestedPrefix: ['@nx', 'more concise and convenient to use; `@` feels redundant'],
  rules: {},
});
