import {definePluginMetadata} from './shared';

export default definePluginMetadata('mobx', {
  configs: ['mobx'],
  docsUrl: 'https://github.com/mobxjs/mobx/blob/main/packages/eslint-plugin-mobx/README.md',
  ruleDocsUrl: (ruleName, ref = 'HEAD') =>
    `https://github.com/mobxjs/mobx/blob/${ref}/packages/eslint-plugin-mobx/README.md#mobx${ruleName}`,
  ruleDocsRefs: {
    'missing-observer': 'eslint-plugin-mobx@0.2.2',
    'no-anonymous-observer': null,
  },
  gitTag: (tag) => `eslint-plugin-mobx@${tag}`,
  rules: {
    'exhaustive-make-observable': {disableInCodeBlocks: 'runtimeOnly'},
    'missing-observer': {disableInCodeBlocks: 'runtimeOnly'},
    'no-anonymous-observer': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
