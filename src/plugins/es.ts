import {definePluginMetadata} from './shared';

export default definePluginMetadata('es', {
  configs: ['es'],
  docsUrl: 'https://eslint-community.github.io/eslint-plugin-es-x',
  ruleDocsUrl: (ruleName) =>
    `https://eslint-community.github.io/eslint-plugin-es-x/rules/${ruleName}.html`,
  suggestedPrefix: [
    'es-x',
    'this plugin is a fork and is meant to replace the original plugin with the original prefix',
  ],
  rules: {},
});
