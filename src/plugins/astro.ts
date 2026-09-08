import {definePluginMetadata} from './shared';

export default definePluginMetadata('astro', {
  configs: ['astro'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-astro',
  ruleDocsUrl: (ruleName) => `https://ota-meshi.github.io/eslint-plugin-astro/rules/${ruleName}`,
  prettierLanguage: 'astro',
  rules: {
    'prefer-class-list-directive': {stylistic: true},
    'prefer-object-class-list': {stylistic: true},
    'prefer-split-class-list': {stylistic: true},
    semi: {stylistic: true, prettierIncompatible: true},
    'sort-attributes': {stylistic: true},
  },
});
