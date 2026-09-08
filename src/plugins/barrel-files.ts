import {definePluginMetadata} from './shared';

export default definePluginMetadata('barrel-files', {
  configs: ['barrelFiles'],
  docsUrl: 'https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
