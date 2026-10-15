import {definePluginMetadata} from './shared';

export default definePluginMetadata('formatjs', {
  configs: ['formatJs'],
  docsUrl: 'https://formatjs.github.io/docs/tooling/linter',
  ruleDocsUrl: (ruleName) => `https://formatjs.github.io/docs/tooling/linter/#${ruleName}`,
  gitTag: (tag) => `eslint-plugin-formatjs@${tag}`,
  rules: {
    'blocklist-elements': {disableInCodeBlocks: 'tooStrict'},
    'enforce-default-message': {disableInCodeBlocks: 'runtimeOnly'},
    'enforce-description': {disableInCodeBlocks: 'tooStrict'},
    'enforce-id': {disableInCodeBlocks: 'runtimeOnly'},
    'no-emoji': {disableInCodeBlocks: 'tooStrict'},
    'no-id': {disableInCodeBlocks: 'runtimeOnly'},
    'no-literal-string-in-jsx': {disableInCodeBlocks: 'tooStrict'},
    'no-literal-string-in-object': {disableInCodeBlocks: 'tooStrict'},
    'no-multiple-plurals': {disableInCodeBlocks: 'tooStrict'},
    'no-offset': {disableInCodeBlocks: 'tooStrict'},
    'prefer-formatted-message': {stylistic: true},
    'prefer-pound-in-plural': {stylistic: true},
  },
});
