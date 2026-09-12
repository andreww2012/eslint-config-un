import {definePluginMetadata} from './shared';

export default definePluginMetadata('import', {
  configs: ['import'],
  docsUrl: 'https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    'import-x',
    'a fork meant to replace the original plugin, so it keeps the original prefix',
  ],
  rules: {
    'consistent-type-specifier-style': {stylistic: true},
    'dynamic-import-chunkname': {disableInCodeBlocks: 'imports'},
    export: {stylistic: true},
    'exports-last': {stylistic: true},
    first: {stylistic: true},
    'group-exports': {stylistic: true},
    'max-dependencies': {disableInCodeBlocks: 'imports'},
    'newline-after-import': {stylistic: true},
    'no-absolute-path': {disableInCodeBlocks: [false, 'TODO: reason was not recorded']},
    'no-default-export': {disableInCodeBlocks: 'imports'},
    'no-duplicates': {stylistic: true, disableInCodeBlocks: 'imports'},
    'no-extraneous-dependencies': {disableInCodeBlocks: 'imports', cliFiles: 'off'},
    'no-mutable-exports': {disableInCodeBlocks: 'imports'},
    'no-unresolved': {disableInCodeBlocks: 'imports'},
    'no-useless-path-segments': {stylistic: true},
    'no-webpack-loader-syntax': {disableInCodeBlocks: [false, 'TODO: reason was not recorded']},
    order: {stylistic: true},
  },
});
