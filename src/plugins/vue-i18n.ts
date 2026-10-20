import {definePluginMetadata} from './shared';

export default definePluginMetadata('vue-i18n', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) => `https://eslint-plugin-vue-i18n.intlify.dev/rules/${ruleName}`,
  suggestedPrefix: ['@intlify/vue-i18n', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'no-duplicate-keys-in-locale': {disableInCodeBlocks: 'tooStrict'},
    'no-dynamic-keys': {disableInCodeBlocks: 'tooStrict'},
    'no-missing-keys': {disableInCodeBlocks: 'tooStrict'},
    'no-missing-keys-in-other-locales': {disableInCodeBlocks: 'tooStrict'},
    'no-raw-text': {disableInCodeBlocks: 'tooStrict'},
    'no-unused-keys': {disableInCodeBlocks: 'unused'},
    'prefer-linked-key-with-paren': {stylistic: true},
  },
});
