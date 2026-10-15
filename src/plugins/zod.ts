import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod', {
  configs: ['zod'],
  isMainPlugin: true,
  docsUrl:
    'https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-zod@${version}`,
  rules: {
    'array-style': {stylistic: true},
    'consistent-import': {stylistic: true},
    'consistent-import-source': {disableInCodeBlocks: 'imports'},
    'consistent-schema-output-type-style': {stylistic: true},
    'no-any-schema': {disableInCodeBlocks: 'typeStrictness'},
    'no-dynamic-schema-value': {disableInCodeBlocks: 'runtimeOnly'},
    'no-function-scoped-schema': {disableInCodeBlocks: 'performance'},
    'no-number-schema-with-int': {stylistic: true},
    'no-unknown-schema': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-map-set-size-over-min-max': {stylistic: true},
    'prefer-nullish': {stylistic: true},
    'prefer-strict-object': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-string-length-over-min-max': {stylistic: true},
    'prefer-string-schema-with-trim': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-tuple-over-array-length': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-validate': {
      stylistic: [false, 'validation stops at the first failure, so later refinements may not run'],
      disableInCodeBlocks: 'runtimeOnly',
    },
    'require-error-message': {disableInCodeBlocks: 'runtimeOnly'},
    'schema-error-property-style': {stylistic: true},
  },
});
