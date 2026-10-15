import {definePluginMetadata} from './shared';

export default definePluginMetadata('solid', {
  configs: ['solid'],
  docsUrl: 'https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/${ruleName}.md`,
  rules: {
    imports: {stylistic: true},
    'jsx-no-undef': {disableInCodeBlocks: 'tooStrict'},
    'no-array-handlers': {disableInCodeBlocks: 'typeStrictness'},
    'no-innerhtml': {disableInCodeBlocks: 'runtimeOnly'},
    'no-module-scope-reactive-primitive': {disableInCodeBlocks: 'runtimeOnly'},
    'no-proxy-apis': {disableInCodeBlocks: 'runtimeOnly'},
    'no-restated-default-options': {stylistic: true},
    'no-unused-signal': {disableInCodeBlocks: 'unused'},
    'prefer-for': {disableInCodeBlocks: 'performance'},
    'prefer-onSettled-for-side-effects': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-show': {stylistic: true},
    'prefer-structured-class': {stylistic: true},
    'self-closing-comp': {stylistic: true},
    'style-prop': {stylistic: true},
  },
});
