import {definePluginMetadata} from './shared';

export default definePluginMetadata('react-debug', {
  configs: ['react'],
  ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
  rules: {
    'function-component': {stylistic: true},
    hook: {stylistic: true},
    'is-from-react': {stylistic: true},
    jsx: {stylistic: true},
  },
});
