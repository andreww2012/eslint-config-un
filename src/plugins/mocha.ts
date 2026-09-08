import {definePluginMetadata} from './shared';

export default definePluginMetadata('mocha', {
  configs: ['mocha'],
  docsUrl: 'https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/${ruleName}.md`,
  gitTag: (tag) => `eslint-plugin-mocha@${tag}`,
  rules: {
    'consistent-spacing-between-blocks': {stylistic: true},
    'consistent-structure': {stylistic: true},
  },
});
