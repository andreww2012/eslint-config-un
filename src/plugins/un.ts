import {definePluginMetadata} from './shared';

export default definePluginMetadata('un', {
  configs: ['un'],
  rules: {
    'prefer-array-for-each': {requiresTypeInfo: 'optional', stylistic: true},
    'vue-no-leading-text-whitespace': {stylistic: true},
  },
});
