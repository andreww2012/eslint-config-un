import {definePluginMetadata} from './shared';

export default definePluginMetadata('perfectionist', {
  configs: ['perfectionist'],
  docsUrl: 'https://perfectionist.dev',
  ruleDocsUrl: (ruleName) => `https://perfectionist.dev/rules/${ruleName}`,
  allRulesStylistic: true,
  rules: {},
});
