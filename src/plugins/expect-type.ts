import {definePluginMetadata} from './shared';

export default definePluginMetadata('expect-type', {
  configs: ['expectType'],
  docsUrl: 'https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
