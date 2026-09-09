import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('e18e', {
  configs: ['e18e'],
  docsUrl: 'https://github.com/e18e/eslint-plugin/blob/HEAD/README.md',
  gitTag: gitTagAsVersion,
  rules: {
    'no-delete-property': {disableInTestFiles: true},
    'no-indexof-equality': {requiresTypeInfo: true, stylistic: true},
    'prefer-array-at': {requiresTypeInfo: 'optional', stylistic: true},
    'prefer-array-fill': {stylistic: true},
    'prefer-array-to-reversed': {requiresTypeInfo: 'optional'},
    'prefer-array-to-sorted': {requiresTypeInfo: 'optional'},
    'prefer-charcode-at-in-loop': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'prefer-date-now': {stylistic: true},
    'prefer-exponentiation-operator': {stylistic: true},
    'prefer-flatmap-over-map-flat': {stylistic: true},
    'prefer-includes': {stylistic: true},
    'prefer-inline-equality': {requiresTypeInfo: 'optional'},
    'prefer-nullish-coalescing': {stylistic: true},
    'prefer-regex-test': {requiresTypeInfo: 'optional'},
    'prefer-spread-syntax': {requiresTypeInfo: 'optional', stylistic: true},
    'prefer-static-collator': {disableInTestFiles: true},
    'prefer-static-regex': {disableInCodeBlocks: 'performance', disableInTestFiles: true},
  },
});
