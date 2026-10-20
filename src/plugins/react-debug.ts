import {definePluginMetadata} from './shared';

export default definePluginMetadata('react-debug', {
  configs: ['react'],
  ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/debug-${ruleName}`,
  rules: {
    'function-component': {stylistic: true},
    hook: {stylistic: true},
    'is-from-react': {stylistic: true},
    'is-from-ref': {disableInCodeBlocks: 'runtimeOnly'},
    jsx: {stylistic: true},
  },
});
