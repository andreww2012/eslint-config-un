import {definePluginMetadata} from './shared';

export default definePluginMetadata('jest', {
  configs: ['jest'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'consistent-test-it': {stylistic: true},
    'no-alias-methods': {stylistic: true},
    'no-interpolation-in-snapshots': {stylistic: true},
    'no-test-prefixes': {stylistic: true},
    'no-unneeded-async-expect-function': {stylistic: true},
    'padding-around-after-all-blocks': {stylistic: true},
    'padding-around-after-each-blocks': {stylistic: true},
    'padding-around-all': {stylistic: true},
    'padding-around-before-all-blocks': {stylistic: true},
    'padding-around-before-each-blocks': {stylistic: true},
    'padding-around-describe-blocks': {stylistic: true},
    'padding-around-expect-groups': {stylistic: true},
    'padding-around-test-blocks': {stylistic: true},
    'prefer-comparison-matcher': {stylistic: true},
    'prefer-each': {stylistic: true},
    'prefer-equality-matcher': {stylistic: true},
    'prefer-expect-resolves': {stylistic: true},
    'prefer-hooks-in-order': {stylistic: true},
    'prefer-hooks-on-top': {stylistic: true},
    'prefer-lowercase-title': {
      stylistic: [false, 'titles name snapshots and are matched by test filters'],
      autofixDisabled: [true, "strings/symbols shouldn't be changed by autofix"],
    },
    'prefer-mock-promise-shorthand': {stylistic: true},
    'prefer-mock-return-shorthand': {stylistic: true},
    'prefer-to-be': {stylistic: true},
    'prefer-to-contain': {stylistic: true},
    'prefer-to-have-been-called-times': {stylistic: true},
    'prefer-to-have-length': {stylistic: true},
    'valid-title': {
      stylistic: [false, 'titles name snapshots and are matched by test filters'],
      autofixDisabled: [true, "strings/symbols shouldn't be changed by autofix"],
    },
  },
});
