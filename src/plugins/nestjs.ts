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
    'forward-ref-injection-should-use-wrapper-type': {requiresTypeInfo: 'optional'},
    'sort-module-metadata-arrays': {stylistic: true},
    'validated-non-primitive-property-needs-type-decorator': {requiresTypeInfo: true},
  },
});
