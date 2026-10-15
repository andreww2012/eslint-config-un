import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod-mini', {
  configs: ['zod'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-zod-mini@${version}`,
  rules: {
    'consistent-import': {stylistic: true},
    'consistent-import-source': {disableInCodeBlocks: 'imports'},
    'consistent-schema-output-type-style': {stylistic: true},
    'no-any-schema': {disableInCodeBlocks: 'typeStrictness'},
    'no-dynamic-schema-value': {disableInCodeBlocks: 'runtimeOnly'},
    'no-function-scoped-schema': {disableInCodeBlocks: 'performance'},
    'no-unknown-schema': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-map-set-size-over-min-max': {stylistic: true},
    'prefer-nullish': {stylistic: true},
    'prefer-string-length-over-min-max': {stylistic: true},
    'prefer-tuple-over-array-length': {disableInCodeBlocks: 'typeStrictness'},
    'prefer-validate': {
      stylistic: [false, 'validation stops at the first failure, so later refinements may not run'],
      disableInCodeBlocks: 'runtimeOnly',
    },
    'require-error-message': {disableInCodeBlocks: 'runtimeOnly'},
    'schema-error-property-style': {stylistic: true},
  },
});
