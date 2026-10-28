import {definePluginMetadata} from './shared';

export default definePluginMetadata('valibot', {
  configs: ['valibot'],
  docsUrl: 'https://github.com/nimaebra/eslint-plugin-valibot/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/nimaebra/eslint-plugin-valibot/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'consistent-import': {stylistic: true},
    'no-any-schema': {disableInCodeBlocks: 'typeStrictness'},
    'no-loose-object': {disableInCodeBlocks: 'runtimeOnly'},
    'no-recreated-schemas': {disableInCodeBlocks: 'performance', disableInTestFiles: true},
    'no-redundant-transformation': {stylistic: true},
    'no-single-member-union': {stylistic: true},
    'no-unguarded-parse': {disableInCodeBlocks: 'runtimeOnly', disableInTestFiles: true},
    'no-unknown-schema': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-nullable-over-union-null': {stylistic: true},
    'prefer-nullish': {stylistic: true},
    'prefer-optional-over-union-undefined': {stylistic: true},
    'prefer-picklist': {stylistic: true},
    'require-issue-messages': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
