import {definePluginMetadata} from './shared';

export default definePluginMetadata('json-schema-validator', {
  configs: ['jsonSchemaValidator'],
  docsUrl: {
    label: 'the single rule docs',
    url: 'https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md',
  },
  ruleDocsUrl: (ruleName) =>
    `https://ota-meshi.github.io/eslint-plugin-json-schema-validator/rules/${ruleName}.html`,
  rules: {
    'no-invalid': {requiresNetwork: true},
  },
});
