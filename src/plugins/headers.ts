import {definePluginMetadata} from './shared';

export default definePluginMetadata('headers', {
  configs: ['headers'],
  docsUrl: 'https://github.com/robmisasi/eslint-plugin-headers/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/robmisasi/eslint-plugin-headers/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
