import {definePluginMetadata} from './shared';

export default definePluginMetadata('storybook', {
  configs: ['storybook'],
  docsUrl: 'https://storybook.js.org/docs/configure/integration/eslint-plugin',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/storybookjs/storybook/blob/HEAD/code/lib/eslint-plugin/docs/rules/${ruleName}.md`,
  rules: {
    'csf-component': {disableInCodeBlocks: 'tooStrict'},
    'default-exports': {disableInCodeBlocks: 'imports'},
    'meta-inline-properties': {disableInCodeBlocks: 'tooStrict'},
    'meta-satisfies-type': {disableInCodeBlocks: 'typeStrictness'},
    'no-title-property-in-meta': {disableInCodeBlocks: 'tooStrict'},
    'no-uninstalled-addons': {disableInCodeBlocks: 'imports'},
    'story-exports': {disableInCodeBlocks: 'imports'},
    'use-storybook-expect': {disableInCodeBlocks: 'imports'},
  },
});
