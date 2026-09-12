import {definePluginMetadata} from './shared';

export default definePluginMetadata('eslint-react', {
  configs: ['react'],
  ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
  suggestedPrefix: [
    '@eslint-react',
    'more concise and convenient to use; `@` feels redundant; `react` is already taken by `eslint-plugin-react`',
  ],
  rules: {
    'jsx-no-key-after-spread': {
      requiresTypeInfo: [false, 'only reads the `jsx` compiler options, never asks about a type'],
    },
    'jsx-no-useless-fragment': {
      requiresTypeInfo: [false, 'only reads the `jsx` compiler options, never asks about a type'],
    },
    'no-implicit-children': {requiresTypeInfo: true},
    'no-implicit-key': {requiresTypeInfo: true},
    'no-implicit-ref': {requiresTypeInfo: true},
    'no-leaked-conditional-rendering': {requiresTypeInfo: true},
    'no-unused-props': {requiresTypeInfo: true},
    'x-no-implicit-children': {requiresTypeInfo: true},
    'x-no-implicit-key': {requiresTypeInfo: true},
    'x-no-implicit-ref': {requiresTypeInfo: true},
    'x-no-leaked-conditional-rendering': {requiresTypeInfo: true},
    'x-no-unused-props': {requiresTypeInfo: true},
  },
});
