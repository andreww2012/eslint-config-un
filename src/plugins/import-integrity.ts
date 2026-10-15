import {definePluginMetadata} from './shared';

export default definePluginMetadata('import-integrity', {
  configs: ['importIntegrity'],
  docsUrl: 'https://github.com/nebrius/import-integrity-lint/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://nebrius.github.io/import-integrity-lint/rules/${ruleName}`,
  rules: {
    'no-cycle': {disableInCodeBlocks: 'imports'},
    'no-empty-entry-points': {disableInCodeBlocks: 'imports'},
    'no-entry-point-imports': {disableInCodeBlocks: 'imports'},
    'no-external-barrel-reexports': {disableInCodeBlocks: 'imports'},
    'no-named-as-default': {disableInCodeBlocks: 'imports'},
    'no-node-builtins': {disableInCodeBlocks: 'runtimeOnly'},
    'no-restricted-imports': {disableInCodeBlocks: 'imports'},
    'no-test-imports-in-prod': {disableInCodeBlocks: 'imports'},
    'no-test-only-imports': {disableInCodeBlocks: 'imports'},
    'no-unnamed-entry-point-exports': {disableInCodeBlocks: 'imports'},
    'no-unresolved-imports': {disableInCodeBlocks: 'imports'},
    'no-unused-exports': {disableInCodeBlocks: 'imports'},
    'no-unused-package-exports': {disableInCodeBlocks: 'imports'},
    'prefer-alias-imports': {stylistic: true},
    'require-node-prefix': {stylistic: true},
  },
});
