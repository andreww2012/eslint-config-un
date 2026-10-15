import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('wc', {
  configs: ['webComponents'],
  docsUrl: 'https://github.com/43081j/eslint-plugin-wc/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/43081j/eslint-plugin-wc/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: gitTagAsVersion,
  rules: {
    'expose-class-on-global': {disableInCodeBlocks: 'tooStrict'},
    'file-name-matches-element': {stylistic: true},
    'guard-define-call': {disableInCodeBlocks: 'runtimeOnly'},
    'guard-super-call': {disableInCodeBlocks: 'runtimeOnly'},
    'max-elements-per-file': {stylistic: true},
    'no-constructor': {disableInCodeBlocks: 'runtimeOnly'},
    'no-customized-built-in-elements': {disableInCodeBlocks: 'runtimeOnly'},
    'no-exports-with-element': {disableInCodeBlocks: 'imports'},
  },
});
