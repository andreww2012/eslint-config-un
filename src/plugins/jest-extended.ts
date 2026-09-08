import {definePluginMetadata} from './shared';

export default definePluginMetadata('jest-extended', {
  configs: ['jest'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/${ruleName}.md`,
  allRulesStylistic: true,
  rules: {},
});
