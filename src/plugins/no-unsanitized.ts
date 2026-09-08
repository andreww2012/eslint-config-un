import {definePluginMetadata} from './shared';

export default definePluginMetadata('no-unsanitized', {
  configs: ['noUnsanitized'],
  docsUrl: 'https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
