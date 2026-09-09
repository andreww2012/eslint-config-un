import {definePluginMetadata} from './shared';

export default definePluginMetadata('rxjs', {
  configs: ['rxjs'],
  docsUrl: 'https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/${ruleName}.md`,
  suggestedPrefix: ['@smarttools/rxjs', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    finnish: {requiresTypeInfo: true, stylistic: true},
    'no-async-subscribe': {requiresTypeInfo: true},
    'no-connectable': {requiresTypeInfo: true},
    'no-create': {requiresTypeInfo: true},
    'no-cyclic-action': {requiresTypeInfo: true},
    'no-exposed-subjects': {requiresTypeInfo: true},
    'no-finnish': {requiresTypeInfo: true, stylistic: true},
    'no-ignored-error': {requiresTypeInfo: true},
    'no-ignored-notifier': {requiresTypeInfo: true},
    'no-ignored-observable': {requiresTypeInfo: true},
    'no-ignored-subscribe': {requiresTypeInfo: true},
    'no-ignored-subscription': {requiresTypeInfo: true},
    'no-implicit-any-catch': {requiresTypeInfo: true},
    'no-nested-subscribe': {requiresTypeInfo: true},
    'no-redundant-notify': {requiresTypeInfo: true},
    'no-subclass': {requiresTypeInfo: true},
    'no-subject-unsubscribe': {requiresTypeInfo: true},
    'no-subject-value': {requiresTypeInfo: true},
    'no-subscribe-handlers': {requiresTypeInfo: true},
    'no-topromise': {requiresTypeInfo: true}, // cspell:disable-line
    'no-unbound-methods': {requiresTypeInfo: true},
    'no-unsafe-catch': {requiresTypeInfo: true},
    'no-unsafe-first': {requiresTypeInfo: true},
    'no-unsafe-subject-next': {requiresTypeInfo: true},
    'no-unsafe-switchmap': {requiresTypeInfo: true}, // cspell:disable-line
    'no-unsafe-takeuntil': {requiresTypeInfo: true}, // cspell:disable-line
    'prefer-observer': {requiresTypeInfo: true},
    'suffix-subjects': {requiresTypeInfo: true, stylistic: true},
    'throw-error': {requiresTypeInfo: true},
  },
});
