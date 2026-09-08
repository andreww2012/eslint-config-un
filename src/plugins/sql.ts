import {definePluginMetadata} from './shared';

export default definePluginMetadata('sql', {
  configs: ['sql'],
  docsUrl: 'https://github.com/gajus/eslint-plugin-sql/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/gajus/eslint-plugin-sql/tree/HEAD?tab=readme-ov-file#${ruleName}`,
  rules: {
    format: {stylistic: true},
  },
});
