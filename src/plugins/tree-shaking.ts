import {definePluginMetadata} from './shared';

export default definePluginMetadata('tree-shaking', {
  configs: ['treeShaking'],
  docsUrl: 'https://github.com/lukastaegert/eslint-plugin-tree-shaking/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/lukastaegert/eslint-plugin-tree-shaking/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
