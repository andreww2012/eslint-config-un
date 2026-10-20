import {definePluginMetadata} from './shared';

// `x-` rules are aliases documented on the page of the rule they alias
const ALIAS_PREFIX_REGEX = /^x-/;

export default definePluginMetadata('eslint-react', {
  configs: ['react'],
  ruleDocsUrl: (ruleName) =>
    `https://eslint-react.xyz/docs/rules/${ruleName.replace(ALIAS_PREFIX_REGEX, '')}`,
  suggestedPrefix: [
    '@eslint-react',
    'more concise and convenient to use; `@` feels redundant; `react` is already taken by `eslint-plugin-react`',
  ],
  rules: {
    'dom-no-dangerously-set-innerhtml': {disableInCodeBlocks: 'runtimeOnly'},
    'dom-no-flush-sync': {disableInCodeBlocks: 'performance'},
    'dom-no-missing-button-type': {disableInCodeBlocks: 'runtimeOnly'},
    'dom-no-missing-iframe-sandbox': {disableInCodeBlocks: 'runtimeOnly'},
    'dom-no-unsafe-target-blank': {disableInCodeBlocks: 'runtimeOnly'},
    'jsx-no-key-after-spread': {
      requiresTypeInfo: [false, 'only reads the `jsx` compiler options, never asks about a type'],
      disableInCodeBlocks: 'performance',
    },
    'jsx-no-useless-fragment': {
      requiresTypeInfo: [false, 'only reads the `jsx` compiler options, never asks about a type'],
    },
    'no-context-provider': {disableInCodeBlocks: 'runtimeOnly'},
    'no-forward-ref': {disableInCodeBlocks: 'runtimeOnly'},
    'no-implicit-children': {requiresTypeInfo: true},
    'no-implicit-key': {requiresTypeInfo: true},
    'no-implicit-ref': {requiresTypeInfo: true},
    'no-leaked-conditional-rendering': {requiresTypeInfo: true},
    'no-missing-component-display-name': {disableInCodeBlocks: 'runtimeOnly'},
    'no-missing-context-display-name': {disableInCodeBlocks: 'runtimeOnly'},
    'no-unstable-context-value': {disableInCodeBlocks: 'performance'},
    'no-unstable-default-props': {disableInCodeBlocks: 'performance'},
    'no-unused-class-component-members': {disableInCodeBlocks: 'unused'},
    'no-unused-props': {requiresTypeInfo: true},
    'no-unused-state': {disableInCodeBlocks: 'unused'},
    'no-use-context': {disableInCodeBlocks: 'runtimeOnly'},
    'rules-of-hooks': {disableInCodeBlocks: 'tooStrict'},
    'x-no-context-provider': {disableInCodeBlocks: 'runtimeOnly'},
    'x-no-forward-ref': {disableInCodeBlocks: 'runtimeOnly'},
    'x-no-implicit-children': {requiresTypeInfo: true},
    'x-no-implicit-key': {requiresTypeInfo: true},
    'x-no-implicit-ref': {requiresTypeInfo: true},
    'x-no-leaked-conditional-rendering': {requiresTypeInfo: true},
    'x-no-missing-component-display-name': {disableInCodeBlocks: 'runtimeOnly'},
    'x-no-missing-context-display-name': {disableInCodeBlocks: 'runtimeOnly'},
    'x-no-unstable-context-value': {disableInCodeBlocks: 'performance'},
    'x-no-unstable-default-props': {disableInCodeBlocks: 'performance'},
    'x-no-unused-class-component-members': {disableInCodeBlocks: 'unused'},
    'x-no-unused-props': {requiresTypeInfo: true},
    'x-no-unused-state': {disableInCodeBlocks: 'unused'},
    'x-no-use-context': {disableInCodeBlocks: 'runtimeOnly'},
    'x-rules-of-hooks': {disableInCodeBlocks: 'tooStrict'},
  },
});
