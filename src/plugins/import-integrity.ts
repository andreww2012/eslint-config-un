import {definePluginMetadata} from './shared';

export default definePluginMetadata('import-integrity', {
  configs: ['importIntegrity'],
  docsUrl: 'https://github.com/nebrius/import-integrity-lint/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://nebrius.github.io/import-integrity-lint/rules/${ruleName}`,
  rules: {
    'prefer-alias-imports': {stylistic: true},
    'require-node-prefix': {stylistic: true},
  },
});
