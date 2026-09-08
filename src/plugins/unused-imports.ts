import {definePluginMetadata} from './shared';

export default definePluginMetadata('unused-imports', {
  configs: ['unusedImports'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/sweepline/eslint-plugin-unused-imports/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-unused-imports': {disableInCodeBlocks: 'tooStrict'},
  },
});
