import {definePluginMetadata} from './shared';

export default definePluginMetadata('i18next', {
  configs: ['i18next'],
  docsUrl: 'https://github.com/edvardchen/eslint-plugin-i18next/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/edvardchen/eslint-plugin-i18next/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-literal-string': {
      requiresTypeInfo: 'optional',
      disableInCodeBlocks: 'tooStrict',
      disableInTestFiles: true,
    },
  },
});
