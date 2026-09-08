import {definePluginMetadata} from './shared';

export default definePluginMetadata('css', {
  configs: ['css'],
  docsUrl: 'https://github.com/eslint/css/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://github.com/eslint/css/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `css-v${version}`,
  rules: {},
});
