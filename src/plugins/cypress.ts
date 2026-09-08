import {definePluginMetadata} from './shared';

export default definePluginMetadata('cypress', {
  configs: ['cypress'],
  docsUrl: 'https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-and': {stylistic: true},
  },
});
