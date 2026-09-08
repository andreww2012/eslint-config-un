import {definePluginMetadata} from './shared';

export default definePluginMetadata('html-processor', {
  configs: ['jsInline'],
  docsUrl: 'https://github.com/BenoitZugmeyer/eslint-plugin-html/blob/HEAD/README.md',
  suggestedPrefix: [
    'html',
    'frees up `html` for `@html-eslint`; this plugin only provides a processor (it has no rules)',
  ],
  rules: {},
});
