import {definePluginMetadata} from './shared';

export default definePluginMetadata('import-zod', {
  configs: ['importZod'],
  docsUrl: 'https://github.com/samchungy/eslint-plugin-import-zod/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/samchungy/eslint-plugin-import-zod/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
