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
    'consistent-schema-output-type-style': {stylistic: true},
    'no-number-schema-with-int': {stylistic: true},
    'prefer-nullish': {stylistic: true},
    'schema-error-property-style': {stylistic: true},
  },
});
