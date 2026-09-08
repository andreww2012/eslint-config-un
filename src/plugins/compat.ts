import {definePluginMetadata} from './shared';

export default definePluginMetadata('compat', {
  configs: ['compat'],
  docsUrl: 'https://github.com/amilajack/eslint-plugin-compat/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/amilajack/eslint-plugin-compat/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
