import {definePluginMetadata} from './shared';

export default definePluginMetadata('docusaurus', {
  configs: ['docusaurus'],
  docsUrl: 'https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin',
  ruleDocsUrl: (ruleName) =>
    `https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin/${ruleName}`,
  suggestedPrefix: ['@docusaurus', 'more concise and convenient to use; `@` feels redundant'],
  rules: {},
});
