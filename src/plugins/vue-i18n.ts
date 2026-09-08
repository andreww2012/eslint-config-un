import {definePluginMetadata} from './shared';

export default definePluginMetadata('vue-i18n', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) => `https://eslint-plugin-vue-i18n.intlify.dev/rules/${ruleName}.html`,
  suggestedPrefix: ['@intlify/vue-i18n', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'prefer-linked-key-with-paren': {stylistic: true},
  },
});
