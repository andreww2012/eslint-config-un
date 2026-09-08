import {definePluginMetadata} from './shared';

export default definePluginMetadata('storybook', {
  configs: ['storybook'],
  docsUrl: 'https://storybook.js.org/docs/configure/integration/eslint-plugin',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/storybookjs/storybook/blob/HEAD/code/lib/eslint-plugin/docs/rules/${ruleName}.md`,
  rules: {},
});
