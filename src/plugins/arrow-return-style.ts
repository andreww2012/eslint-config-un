import {definePluginMetadata} from './shared';

export default definePluginMetadata('arrow-return-style', {
  configs: ['arrowReturnStyle'],
  docsUrl:
    'https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/src/rules/${ruleName}/documentation.md`,
  suggestedPrefix: [
    'arrow-return-style-x',
    'this plugin is a fork and is meant to replace the original plugin with the original prefix',
  ],
  rules: {
    'arrow-return-style': {stylistic: true},
    'no-export-default-arrow': {disableInCodeBlocks: 'tooStrict'},
  },
});
