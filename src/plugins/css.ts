import {definePluginMetadata} from './shared';

export default definePluginMetadata('css', {
  configs: ['css'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/eslint/css/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://github.com/eslint/css/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `css-v${version}`,
  rules: {},
});
