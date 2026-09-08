import {definePluginMetadata} from './shared';

export default definePluginMetadata('module-interop', {
  configs: ['moduleInterop'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-module-interop',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-module-interop/rules/${ruleName}.html`,
  rules: {},
});
