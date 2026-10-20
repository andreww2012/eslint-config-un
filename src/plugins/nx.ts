import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('nx', {
  configs: ['nx'],
  docsUrl: 'https://nx.dev/docs/technologies/eslint/eslint-plugin',
  ruleDocsUrl: (ruleName) => `https://nx.dev/docs/kb/${ruleName}`,
  ruleDocsRefs: {
    'nx-plugin-checks': null,
  },
  gitTag: gitTagAsVersion,
  suggestedPrefix: ['@nx', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'dependency-checks': {disableInCodeBlocks: 'fileName'},
    'enforce-module-boundaries': {disableInCodeBlocks: 'imports'},
    'nx-plugin-checks': {disableInCodeBlocks: 'fileName'},
  },
});
