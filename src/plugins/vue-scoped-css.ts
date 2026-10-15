import {definePluginMetadata} from './shared';

export default definePluginMetadata('vue-scoped-css', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) =>
    `https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/${ruleName}.html`,
  rules: {
    'enforce-style-type': {disableInCodeBlocks: 'tooStrict'},
    'no-unused-keyframes': {disableInCodeBlocks: 'unused'},
    'no-unused-selector': {disableInCodeBlocks: 'unused'},
    'require-scoped': {disableInCodeBlocks: 'tooStrict'},
    'require-selector-used-inside': {disableInCodeBlocks: 'unused'},
    'v-deep-pseudo-style': {stylistic: true},
    'v-global-pseudo-style': {stylistic: true},
    'v-slotted-pseudo-style': {stylistic: true},
  },
});
