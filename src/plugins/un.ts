import {definePluginMetadata} from './shared';

export default definePluginMetadata('un', {
  configs: ['un'],
  rules: {
    'vue-no-leading-text-whitespace': {stylistic: true},
  },
});
