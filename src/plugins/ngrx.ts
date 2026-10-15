import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('ngrx', {
  configs: ['ngrx'],
  docsUrl: 'https://ngrx.io/guide/eslint-plugin',
  ruleDocsUrl: (ruleName) => `https://ngrx.io/guide/eslint-plugin/rules/${ruleName}`,
  gitTag: gitTagAsVersion,
  suggestedPrefix: ['@ngrx', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'avoid-combining-component-store-selectors': {disableInCodeBlocks: 'tooStrict'},
    'avoid-combining-selectors': {disableInCodeBlocks: 'tooStrict'},
    'avoid-dispatching-multiple-actions-sequentially': {disableInCodeBlocks: 'tooStrict'},
    'avoid-mapping-component-store-selectors': {disableInCodeBlocks: 'tooStrict'},
    'avoid-mapping-selectors': {disableInCodeBlocks: 'tooStrict'},
    'no-store-subscription': {disableInCodeBlocks: 'runtimeOnly'},
    'no-typed-global-store': {disableInCodeBlocks: 'typeStrictness'},
    'on-function-explicit-return-type': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-concat-latest-from': {disableInCodeBlocks: 'performance'},
    'prefer-protected-state': {disableInCodeBlocks: 'tooStrict'},
    'select-style': {stylistic: true},
    'updater-explicit-return-type': {disableInCodeBlocks: 'typeStrictness'},
    'use-effects-lifecycle-interface': {disableInCodeBlocks: 'typeStrictness'},
  },
});
