import {definePluginMetadata} from './shared';

export default definePluginMetadata('nestjs', {
  configs: [
    'nestJs', // eslint-disable-line case-police/string-check
  ],
  docsUrl: 'https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    '@darraghor/nestjs-typed',
    'more concise and convenient to use; `@` feels redundant',
  ],
  rules: {
    'all-properties-have-explicit-defined': {requiresTypeInfo: true},
    'api-enum-property-best-practices': {requiresTypeInfo: true},
    'api-method-should-specify-api-operation': {disableInCodeBlocks: 'tooStrict'},
    'api-method-should-specify-api-response': {disableInCodeBlocks: 'tooStrict'},
    'api-methods-should-be-guarded': {disableInCodeBlocks: 'runtimeOnly'},
    'api-property-matches-property-optionality': {disableInCodeBlocks: 'tooStrict'},
    'api-property-returning-array-should-set-array': {disableInCodeBlocks: 'tooStrict'},
    'api-property-should-have-api-extra-models': {disableInCodeBlocks: 'tooStrict'},
    'controllers-should-supply-api-tags': {disableInCodeBlocks: 'tooStrict'},
    'forward-ref-injection-should-use-wrapper-type': {
      requiresTypeInfo: [true, 'does nothing without the compiler options instead of throwing'],
    },
    'injectable-should-be-provided': {disableInCodeBlocks: 'imports'},
    'sort-module-metadata-arrays': {stylistic: true},
    'swagger-file-upload-should-be-documented': {disableInCodeBlocks: 'tooStrict'},
    'uploaded-file-should-be-validated': {disableInCodeBlocks: 'runtimeOnly'},
    'use-dependency-injection': {disableInCodeBlocks: 'tooStrict'},
    'validated-non-primitive-property-needs-type-decorator': {requiresTypeInfo: true},
  },
});
