import {definePluginMetadata} from './shared';

export default definePluginMetadata('rxjs', {
  configs: ['rxjs'],
  docsUrl: 'https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/${ruleName}.md`,
  suggestedPrefix: ['@smarttools/rxjs', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    finnish: {stylistic: true},
    'no-finnish': {stylistic: true},
    'suffix-subjects': {stylistic: true},
  },
});
