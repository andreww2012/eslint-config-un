import {definePluginMetadata} from './shared';

export default definePluginMetadata('eslint-react', {
  configs: ['react'],
  ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
  suggestedPrefix: [
    '@eslint-react',
    "more concise and convenient to use; `@` feels redundant; can't be `react` - already taken by `eslint-plugin-react`",
  ],
  rules: {
    'no-implicit-children': {requiresTypeInfo: true},
    'no-implicit-key': {requiresTypeInfo: true},
    'no-implicit-ref': {requiresTypeInfo: true},
    'no-leaked-conditional-rendering': {requiresTypeInfo: true},
    'no-unused-props': {requiresTypeInfo: true},
  },
});
