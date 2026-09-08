import {definePluginMetadata} from './shared';

export default definePluginMetadata('de-morgan', {
  configs: ['deMorgan'],
  docsUrl: 'https://github.com/azat-io/eslint-plugin-de-morgan/blob/HEAD/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/azat-io/eslint-plugin-de-morgan/blob/HEAD/docs/${ruleName}.md`,
  rules: {
    'no-negated-conjunction': {stylistic: true},
    'no-negated-disjunction': {stylistic: true},
  },
});
