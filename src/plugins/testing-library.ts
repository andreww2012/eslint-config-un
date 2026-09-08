import {definePluginMetadata} from './shared';

export default definePluginMetadata('testing-library', {
  configs: ['testingLibrary'],
  docsUrl: 'https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
