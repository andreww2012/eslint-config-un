import {definePluginMetadata} from './shared';

export default definePluginMetadata('nuxt', {
  configs: ['vue'],
  rules: {
    'nuxt-config-keys-order': {stylistic: true},
  },
});
