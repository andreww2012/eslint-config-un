import {definePluginMetadata, htmlEslintFrameworkRuleDocsUrl} from './shared';

export default definePluginMetadata('html-angular', {
  configs: ['angular'],
  docsUrl: 'https://html-eslint.org/docs/angular-template/getting-started',
  ruleDocsUrl: htmlEslintFrameworkRuleDocsUrl('angular-template'),
  suggestedPrefix: [
    '@html-eslint/angular-template',
    'more concise and convenient to use; `@` feels redundant',
  ],
  prettierLanguage: 'html',
  rules: {
    'class-spacing': {stylistic: true, prettierIncompatible: true},
    'no-restricted-attr-values': {disableInCodeBlocks: 'tooStrict'},
    'no-restricted-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-li-container': {disableInCodeBlocks: 'tooStrict'},
    'use-baseline': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
