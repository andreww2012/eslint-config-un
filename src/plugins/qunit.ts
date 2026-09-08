import {definePluginMetadata} from './shared';

export default definePluginMetadata('qunit', {
  configs: ['qunit'],
  docsUrl: 'https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
