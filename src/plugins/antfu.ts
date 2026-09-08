import {definePluginMetadata} from './shared';

export default definePluginMetadata('antfu', {
  configs: ['antfu'],
  docsUrl: 'https://github.com/antfu/eslint-plugin-antfu/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/antfu/eslint-plugin-antfu/blob/HEAD/src/rules/${ruleName}.md`,
  prettierLanguage: 'js',
  rules: {
    'consistent-chaining': {stylistic: true, prettierIncompatible: true},
    'consistent-list-newline': {stylistic: true, prettierIncompatible: true},
    curly: {stylistic: true, prettierIncompatible: true},
    'if-newline': {stylistic: true, prettierIncompatible: true},
  },
});
