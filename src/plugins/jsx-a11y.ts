import {definePluginMetadata} from './shared';

export default definePluginMetadata('jsx-a11y', {
  configs: ['jsxA11y'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/es-tooling/eslint-plugin-jsx-a11y-x/blob/HEAD/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    'jsx-a11y-x',
    'a fork meant to replace the original plugin, so it keeps the original prefix',
  ],
  rules: {},
});
