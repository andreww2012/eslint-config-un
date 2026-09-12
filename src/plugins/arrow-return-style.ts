import {definePluginMetadata} from './shared';

export default definePluginMetadata('arrow-return-style', {
  configs: ['arrowReturnStyle'],
  docsUrl:
    'https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/src/rules/${ruleName}/documentation.md`,
  suggestedPrefix: [
    'arrow-return-style-x',
    'a fork meant to replace the original plugin, so it keeps the original prefix',
  ],
  rules: {
    'arrow-return-style': {stylistic: true},
    'no-export-default-arrow': {
      requiresTypeInfo: [
        false,
        'the plugin sets `requiresTypeChecking`, but the rule never reads the parser services: its `program` is the AST node',
      ],
      disableInCodeBlocks: 'tooStrict',
    },
  },
});
