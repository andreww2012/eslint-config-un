import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('depend', {
  configs: ['depend'],
  docsUrl: 'https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {},
});
