import {definePluginMetadata, htmlEslintFrameworkRuleDocsUrl} from './shared';

export default definePluginMetadata('html-react', {
  configs: ['react'],
  docsUrl: 'https://html-eslint.org/docs/react/getting-started',
  ruleDocsUrl: htmlEslintFrameworkRuleDocsUrl('react'),
  suggestedPrefix: [
    '@html-eslint/react',
    'more concise and convenient to use; `@` feels redundant',
  ],
  rules: {
    'classname-spacing': {stylistic: true},
    'no-restricted-attr-values': {disableInCodeBlocks: 'tooStrict'},
    'no-restricted-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-attrs': {disableInCodeBlocks: 'tooStrict'},
    'require-li-container': {disableInCodeBlocks: 'tooStrict'},
    'use-baseline': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
