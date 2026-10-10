import {definePluginMetadata} from './shared';

export default definePluginMetadata('format', {
  configs: ['format'],
  rules: {
    dprint: {stylistic: true},
    oxfmt: {stylistic: true},
    prettier: {stylistic: true},
  },
});
