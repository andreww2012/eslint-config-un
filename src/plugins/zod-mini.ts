import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod-mini', {
  configs: ['zod'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-zod-mini@${version}`,
  rules: {
    'consistent-import': {stylistic: true},
    'consistent-schema-output-type-style': {stylistic: true},
    'prefer-map-set-size-over-min-max': {stylistic: true},
    'prefer-nullish': {stylistic: true},
    'prefer-string-length-over-min-max': {stylistic: true},
    'schema-error-property-style': {stylistic: true},
  },
});
