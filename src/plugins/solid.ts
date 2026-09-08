import {definePluginMetadata} from './shared';

export default definePluginMetadata('solid', {
  configs: ['solid'],
  docsUrl: 'https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/${ruleName}.md`,
  rules: {
    imports: {stylistic: true},
    'no-restated-default-options': {stylistic: true},
    'prefer-show': {stylistic: true},
    'prefer-structured-class': {stylistic: true},
    'self-closing-comp': {stylistic: true},
    'style-prop': {stylistic: true},
  },
});
