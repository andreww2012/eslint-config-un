import {definePluginMetadata} from './shared';

export default definePluginMetadata('no-type-assertion', {
  configs: ['ts'],
  rules: {
    'no-type-assertion': {stylistic: true},
  },
});
