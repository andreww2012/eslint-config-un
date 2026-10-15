import {definePluginMetadata} from './shared';

export default definePluginMetadata('un', {
  configs: ['un'],
  rules: {
    'no-type-assertion': {
      requiresTypeInfo: 'optional',
      stylistic: [false, 'replacing an assertion that narrows the type takes a runtime check'],
      disableInCodeBlocks: 'typeStrictness',
    },
    'prefer-array-for-each': {requiresTypeInfo: 'optional', stylistic: true},
    'vue-no-leading-text-whitespace': {stylistic: true},
    'vue-no-trailing-element-whitespace': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
