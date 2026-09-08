import {definePluginMetadata} from './shared';

export default definePluginMetadata('zod-core', {
  configs: ['zod'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/docs/rules/${ruleName}.md`,
  gitTag: (version) => `eslint-plugin-zod-core@${version}`,
  rules: {
    'consistent-import': {stylistic: true},
    'consistent-schema-output-type-style': {stylistic: true},
  },
});
