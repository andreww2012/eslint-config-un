import {definePluginMetadata} from './shared';

export default definePluginMetadata('jest-dom', {
  configs: ['jestDom'],
  docsUrl: 'https://github.com/testing-library/eslint-plugin-jest-dom/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/testing-library/eslint-plugin-jest-dom/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {},
});
