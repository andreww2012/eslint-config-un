import {definePluginMetadata} from './shared';

export default definePluginMetadata('un', {
  configs: ['un'],
  rules: {
    'consistent-nullish-comparison': {requiresTypeInfo: 'optional', stylistic: true},
    'no-array-reverse': {requiresTypeInfo: 'optional'},
    'no-array-sort': {requiresTypeInfo: 'optional'},
    'no-array-splice': {requiresTypeInfo: 'optional'},
    'no-type-assertion': {
      requiresTypeInfo: 'optional',
      stylistic: [false, 'replacing an assertion that narrows the type takes a runtime check'],
      disableInCodeBlocks: 'typeStrictness',
    },
    'prefer-array-for-each': {requiresTypeInfo: 'optional', stylistic: true},
    'prefer-logical-or': {requiresTypeInfo: true, stylistic: true},
    'vue-no-leading-text-whitespace': {stylistic: true},
    'vue-no-trailing-element-whitespace': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
