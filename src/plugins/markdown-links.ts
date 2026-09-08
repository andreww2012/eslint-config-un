import {definePluginMetadata} from './shared';

export default definePluginMetadata('markdown-links', {
  configs: ['markdownLinks'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-markdown-links',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/${ruleName}.html`,
  rules: {
    'no-dead-urls': {requiresNetwork: true},
  },
});
