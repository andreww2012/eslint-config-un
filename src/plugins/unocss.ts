import {definePluginMetadata} from './shared';

export default definePluginMetadata('unocss', {
  configs: ['unocss'],
  docsUrl: 'https://unocss.dev/integrations/eslint',
  // No rule has a page of its own
  ruleDocsUrl: () => 'https://unocss.dev/integrations/eslint#rules',
  suggestedPrefix: ['@unocss', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    blocklist: {disableInCodeBlocks: 'runtimeOnly'},
    'enforce-class-compile': {disableInCodeBlocks: 'runtimeOnly'},
    order: {stylistic: true},
    'order-attributify': {stylistic: true},
  },
});
