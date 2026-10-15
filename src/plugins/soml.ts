import {definePluginMetadata} from './shared';

export default definePluginMetadata('soml', {
  configs: ['soml'],
  docsUrl: 'https://github.com/soml-lang/eslint-soml/blob/HEAD/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/soml-lang/eslint-soml/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    format: {stylistic: true},
    'key-name-casing': {disableInCodeBlocks: 'tooStrict'},
    'no-block-string-edge-blank-lines': {stylistic: true},
    'no-invisible-characters': {
      stylistic: [
        false,
        'an invisible character is usually a mistake, and removing it from a string changes the value',
      ],
    },
    'no-negative-zero': {stylistic: true},
    'no-placeholder-values': {disableInCodeBlocks: 'tooStrict'},
    'no-zero-duration-parts': {stylistic: true},
    'numeric-separators-style': {stylistic: true},
    'prefer-bare-keys': {stylistic: true},
    'prefer-literal-strings': {stylistic: true},
    'prefer-utc-instants': {stylistic: true},
    'sort-keys': {stylistic: true},
    'spaced-comment': {stylistic: true},
  },
});
