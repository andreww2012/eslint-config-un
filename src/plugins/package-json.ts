import {definePluginMetadata} from './shared';

export default definePluginMetadata('package-json', {
  configs: ['packageJson'],
  docsUrl: 'https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://eslint-plugin-package-json.dev/rules/${ruleName}`,
  rules: {
    'bin-name-casing': {stylistic: true},
    'no-empty-fields': {stylistic: true},
    'order-properties': {stylistic: true},
    'scripts-name-casing': {stylistic: true},
    'sort-collections': {stylistic: true},
  },
});
