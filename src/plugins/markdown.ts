import {definePluginMetadata} from './shared';

export default definePluginMetadata('markdown', {
  configs: ['markdown'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/eslint/markdown/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint/markdown/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
