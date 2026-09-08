import {definePluginMetadata} from './shared';

export default definePluginMetadata('jsdoc', {
  configs: ['jsdoc'],
  docsUrl: 'https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'check-alignment': {stylistic: true},
    'check-indentation': {stylistic: true},
    'check-line-alignment': {stylistic: true},
    'lines-before-block': {stylistic: true},
    'multiline-blocks': {stylistic: true},
    'no-blank-block-descriptions': {stylistic: true},
    'no-multi-asterisks': {stylistic: true},
    'no-unnecessary-type-assertion': {requiresTypeInfo: 'optional'},
    'prefer-import-tag': {stylistic: true},
    'require-asterisk-prefix': {stylistic: true},
    'sort-tags': {stylistic: true},
    'tag-lines': {stylistic: true},
    'type-formatting': {stylistic: true},
  },
});
