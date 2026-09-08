import {definePluginMetadata} from './shared';

export default definePluginMetadata('boundaries', {
  configs: ['boundaries'],
  docsUrl: 'https://www.jsboundaries.dev',
  ruleDocsUrl: (ruleName) => `https://jsboundaries.dev/docs/rules/${ruleName}`,
  rules: {},
});
