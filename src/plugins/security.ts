import {definePluginMetadata} from './shared';

export default definePluginMetadata('security', {
  configs: ['security'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-security-v${version}`,
  rules: {},
});
