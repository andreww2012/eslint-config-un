import {definePluginMetadata} from './shared';

export default definePluginMetadata('unhead', {
  configs: ['unhead'],
  docsUrl: 'https://github.com/unjs/unhead/blob/HEAD/packages/eslint-plugin/README.md',
  suggestedPrefix: ['@unhead', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'defer-on-module-script': {stylistic: true},
    'numeric-tag-priority': {
      stylistic: [false, 'since the suggested aliases resolve to different priorities'],
    },
    'prefer-define-helpers': {stylistic: true},
  },
});
