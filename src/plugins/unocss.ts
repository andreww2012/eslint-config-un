import {definePluginMetadata} from './shared';

export default definePluginMetadata('unocss', {
  configs: ['unocss'],
  docsUrl: 'https://unocss.dev/integrations/eslint',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/Gastonite/eslint-plugin-better-unocss/blob/HEAD/docs/rules/${ruleName}.md`,
  suggestedPrefix: ['@unocss', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    blocklist: {disableInCodeBlocks: 'runtimeOnly'},
    'enforce-class-compile': {disableInCodeBlocks: 'runtimeOnly'},
    order: {stylistic: true},
    'order-attributify': {stylistic: true},
  },
});
