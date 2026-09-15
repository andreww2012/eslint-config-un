import {definePluginMetadata} from './shared';

export default definePluginMetadata('node-dependencies', {
  configs: ['nodeDependencies'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-node-dependencies',
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/${ruleName}.html`,
  rules: {
    'compat-engines': {requiresNetwork: true},
    'no-deprecated': {requiresNetwork: true},
    'no-restricted-deps': {requiresNetwork: true},
    'require-provenance-deps': {requiresNetwork: true},
    'valid-engines': {requiresNetwork: true},
  },
});
