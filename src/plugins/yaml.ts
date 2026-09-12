import {definePluginMetadata} from './shared';

export default definePluginMetadata('yaml', {
  configs: ['yaml'],
  docsUrl: 'https://ota-meshi.github.io/eslint-plugin-yml',
  ruleDocsUrl: (ruleName) => `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
  suggestedPrefix: [
    'yml',
    'consistent with the official language name (and `eslint-plugin-yaml` is far less popular)',
  ],
  prettierLanguage: 'yaml',
  rules: {
    'block-mapping': {stylistic: true},
    'block-mapping-colon-indicator-newline': {stylistic: true, prettierIncompatible: true},
    'block-mapping-question-indicator-newline': {stylistic: true, prettierIncompatible: true},
    'block-sequence': {stylistic: true},
    'block-sequence-hyphen-indicator-newline': {stylistic: true, prettierIncompatible: true},
    'file-extension': {
      stylistic: true,
      disableInCodeBlocks: [
        'tooStrict',
        'conflicts with `markdown-preferences/canonical-code-block-language` by default, can also be handled by that rule and it\'s confusing for users to see the word "extension" in the lint message',
      ],
    },
    'flow-mapping-curly-newline': {stylistic: true, prettierIncompatible: true},
    'flow-mapping-curly-spacing': {stylistic: true, prettierIncompatible: true},
    'flow-sequence-bracket-newline': {stylistic: true, prettierIncompatible: true},
    'flow-sequence-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    indent: {stylistic: true, prettierIncompatible: true},
    'key-spacing': {stylistic: true, prettierIncompatible: true},
    'no-multiple-empty-lines': {stylistic: true, prettierIncompatible: true},
    'no-trailing-spaces': {stylistic: true, prettierIncompatible: true},
    'no-trailing-zeros': {stylistic: true, prettierIncompatible: true},
    'plain-scalar': {stylistic: true},
    quotes: {stylistic: true, prettierIncompatible: true},
    'require-string-key': {stylistic: true},
    'sort-keys': {stylistic: true},
    'sort-sequence-values': {stylistic: true},
    'spaced-comment': {stylistic: true},
  },
});
