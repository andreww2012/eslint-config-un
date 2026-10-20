import {definePluginMetadata, htmlEslintFrameworkRuleDocsUrl} from './shared';

export default definePluginMetadata('html-svelte', {
  configs: ['svelte'],
  docsUrl: 'https://html-eslint.org/docs/svelte/getting-started',
  ruleDocsUrl: htmlEslintFrameworkRuleDocsUrl('svelte'),
  suggestedPrefix: [
    '@html-eslint/svelte',
    'more concise and convenient to use; `@` feels redundant',
  ],
  rules: {
    'class-spacing': {stylistic: true},
    'no-restricted-attr-values': {disableInCodeBlocks: 'tooStrict'},
    'no-restricted-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-li-container': {disableInCodeBlocks: 'tooStrict'},
    'use-baseline': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
