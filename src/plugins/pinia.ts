import {definePluginMetadata} from './shared';

export default definePluginMetadata('pinia', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'prefer-use-store-naming-convention': {stylistic: true},
  },
});
