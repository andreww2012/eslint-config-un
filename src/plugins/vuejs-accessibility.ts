import {definePluginMetadata} from './shared';

export default definePluginMetadata('vuejs-accessibility', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) =>
    `https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/${ruleName}.html`,
  rules: {},
});
