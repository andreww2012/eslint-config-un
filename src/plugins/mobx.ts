import {definePluginMetadata} from './shared';

export default definePluginMetadata('mobx', {
  configs: ['mobx'],
  docsUrl: 'https://github.com/mobxjs/mobx/blob/main/packages/eslint-plugin-mobx/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/mobxjs/mobx/blob/HEAD/packages/eslint-plugin-mobx/README.md#mobx${ruleName}`,
  ruleDocsRefs: {
    'no-anonymous-observer': null,
  },
  gitTag: (tag) => `eslint-plugin-mobx@${tag}`,
  rules: {
    'exhaustive-make-observable': {disableInCodeBlocks: 'runtimeOnly'},
    'missing-make-observable': {disableInCodeBlocks: 'runtimeOnly'},
    'missing-observer': {disableInCodeBlocks: 'runtimeOnly'},
    'no-anonymous-observer': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
