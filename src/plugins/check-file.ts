import {definePluginMetadata} from './shared';

export default definePluginMetadata('check-file', {
  configs: ['checkFile'],
  docsUrl: 'https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
