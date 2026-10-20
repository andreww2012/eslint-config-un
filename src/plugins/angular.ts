import {definePluginMetadata} from './shared';

export default definePluginMetadata('angular', {
  configs: ['angular'],
  isMainPlugin: true,
  docsUrl:
    'https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/README.md',
  ruleDocsUrl: (ruleName, ref = 'HEAD') =>
    `https://github.com/angular-eslint/angular-eslint/blob/${ref}/packages/eslint-plugin/docs/rules/${ruleName}.md`,
  // Removed rules
  ruleDocsRefs: {
    'no-conflicting-lifecycle': 'v21.4.0',
    'no-host-metadata-property': 'v18.4.3',
    'prefer-standalone-component': 'v18.4.3',
    'sort-ngmodule-metadata-arrays': 'v18.4.3',
  },
  suggestedPrefix: ['@angular-eslint', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'component-class-suffix': {stylistic: true},
    'component-max-inline-declarations': {stylistic: true},
    'component-selector': {stylistic: true},
    'directive-class-suffix': {stylistic: true},
    'directive-selector': {stylistic: true},
    'no-async-lifecycle-method': {disableInCodeBlocks: 'runtimeOnly'},
    'no-developer-preview': {requiresTypeInfo: true},
    'no-empty-lifecycle-method': {disableInCodeBlocks: 'emptiness'},
    'no-experimental': {requiresTypeInfo: true},
    'no-pipe-impure': {disableInCodeBlocks: 'performance'},
    'no-uncalled-signals': {requiresTypeInfo: true},
    'pipe-prefix': {stylistic: true},
    'prefer-on-push-component-change-detection': {disableInCodeBlocks: 'performance'},
    'prefer-output-emitter-ref': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-service-decorator': {stylistic: true},
    'prefer-signal-model': {requiresTypeInfo: true},
    'prefer-signals': {requiresTypeInfo: true},
    'prefer-standalone': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-standalone-component': {disableInCodeBlocks: 'runtimeOnly'},
    'reactive-context-must-read-signal': {requiresTypeInfo: true},
    'require-localize-metadata': {disableInCodeBlocks: 'tooStrict'},
    'runtime-localize': {disableInCodeBlocks: 'runtimeOnly'},
    'sort-keys-in-type-decorator': {stylistic: true},
    'sort-lifecycle-methods': {stylistic: true},
    'use-component-selector': {disableInCodeBlocks: 'tooStrict'},
    'use-injectable-provided-in': {disableInCodeBlocks: 'tooStrict'},
    'use-lifecycle-interface': {disableInCodeBlocks: 'typeStrictness'},
    'use-pipe-transform-interface': {disableInCodeBlocks: 'typeStrictness'},
  },
});
