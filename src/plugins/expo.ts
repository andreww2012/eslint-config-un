import {definePluginMetadata} from './shared';

export default definePluginMetadata('expo', {
  configs: ['expo'],
  docsUrl: 'https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/docs/rules/${ruleName}.md`,
  gitTag: 'https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/CHANGELOG.md',
  rules: {
    'use-dom-exports': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
