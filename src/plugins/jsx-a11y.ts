import {definePluginMetadata} from './shared';

export default definePluginMetadata('jsx-a11y', {
  configs: ['jsxA11y'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/es-tooling/eslint-plugin-jsx-a11y-x/blob/HEAD/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    'jsx-a11y-x',
    'this plugin is a fork and is meant to replace the original plugin with the original prefix',
  ],
  rules: {},
});
