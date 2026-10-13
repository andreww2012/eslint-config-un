import {definePluginMetadata} from './shared';

export default definePluginMetadata('lit-a11y', {
  configs: ['lit'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/${ruleName}.md`,
  gitTag: (tag) => `eslint-plugin-lit-a11y@${tag}`,
  rules: {},
});
