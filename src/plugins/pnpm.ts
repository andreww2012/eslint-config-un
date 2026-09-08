import {definePluginMetadata} from './shared';

export default definePluginMetadata('pnpm', {
  configs: ['pnpm'],
  rules: {
    'yaml-blank-lines': {stylistic: true},
  },
});
