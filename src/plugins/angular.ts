import {definePluginMetadata} from './shared';

export default definePluginMetadata('angular', {
  configs: ['angular'],
  isMainPlugin: true,
  docsUrl:
    'https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
  suggestedPrefix: ['@angular-eslint', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'component-class-suffix': {stylistic: true},
    'component-max-inline-declarations': {stylistic: true},
    'component-selector': {stylistic: true},
    'directive-class-suffix': {stylistic: true},
    'directive-selector': {stylistic: true},
    'no-developer-preview': {requiresTypeInfo: true},
    'no-experimental': {requiresTypeInfo: true},
    'no-uncalled-signals': {requiresTypeInfo: true},
    'pipe-prefix': {stylistic: true},
    'prefer-service-decorator': {stylistic: true},
    'prefer-signal-model': {requiresTypeInfo: true},
    'prefer-signals': {requiresTypeInfo: true},
    'reactive-context-must-read-signal': {requiresTypeInfo: true},
    'sort-keys-in-type-decorator': {stylistic: true},
    'sort-lifecycle-methods': {stylistic: true},
  },
});
