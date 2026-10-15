import {definePluginMetadata} from './shared';

export default definePluginMetadata('barrel-files', {
  configs: ['barrelFiles'],
  docsUrl: 'https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'avoid-barrel-files': {disableInCodeBlocks: 'imports'},
    'avoid-importing-barrel-files': {disableInCodeBlocks: 'imports'},
    'avoid-namespace-import': {disableInCodeBlocks: 'performance'},
    'avoid-re-export-all': {disableInCodeBlocks: 'imports'},
  },
});
