import {definePluginMetadata} from './shared';

export default definePluginMetadata('format', {
  configs: ['format'],
  docsUrl: 'https://github.com/antfu/eslint-plugin-format/blob/HEAD/README.md',
  rules: {
    dprint: {stylistic: true},
    prettier: {stylistic: true},
  },
});
