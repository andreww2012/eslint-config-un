import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('erasable-syntax-only', {
  configs: ['erasableSyntaxOnly'],
  docsUrl:
    'https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {},
});
