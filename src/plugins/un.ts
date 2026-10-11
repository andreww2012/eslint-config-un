import {definePluginMetadata} from './shared';

export default definePluginMetadata('un', {
  configs: ['un'],
  rules: {
    'no-type-assertion': {
      requiresTypeInfo: 'optional',
      stylistic: [false, 'replacing an assertion that narrows the type takes a runtime check'],
      disableInCodeBlocks: 'tooStrict',
    },
    'prefer-array-for-each': {requiresTypeInfo: 'optional', stylistic: true},
    'vue-no-leading-text-whitespace': {stylistic: true},
  },
});
