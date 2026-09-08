import {definePluginMetadata} from './shared';

export default definePluginMetadata('sentences-per-line', {
  configs: ['markdown'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/JoshuaKGoldberg/sentences-per-line/blob/HEAD/packages/eslint-plugin-sentences-per-line/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-sentences-per-line@v${version}`,
  rules: {
    one: {stylistic: true},
  },
});
