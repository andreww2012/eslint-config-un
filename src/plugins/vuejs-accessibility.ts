import {definePluginMetadata} from './shared';

export default definePluginMetadata('vuejs-accessibility', {
  configs: ['vue'],
  ruleDocsUrl: (ruleName) =>
    `https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/${ruleName}.html`,
  rules: {
    'alt-text': {disableInCodeBlocks: 'runtimeOnly'},
    'anchor-has-content': {disableInCodeBlocks: 'runtimeOnly'},
    'click-events-have-key-events': {disableInCodeBlocks: 'runtimeOnly'},
    'form-control-has-label': {disableInCodeBlocks: 'runtimeOnly'},
    'heading-has-content': {disableInCodeBlocks: 'runtimeOnly'},
    'iframe-has-title': {disableInCodeBlocks: 'runtimeOnly'},
    'interactive-supports-focus': {disableInCodeBlocks: 'runtimeOnly'},
    'label-has-for': {disableInCodeBlocks: 'runtimeOnly'},
    'media-has-caption': {disableInCodeBlocks: 'runtimeOnly'},
    'mouse-events-have-key-events': {disableInCodeBlocks: 'runtimeOnly'},
    'no-access-key': {disableInCodeBlocks: 'runtimeOnly'},
    'no-aria-hidden-on-focusable': {disableInCodeBlocks: 'runtimeOnly'},
    'no-autofocus': {disableInCodeBlocks: 'runtimeOnly'},
    'no-onchange': {disableInCodeBlocks: 'runtimeOnly'},
    'no-redundant-roles': {disableInCodeBlocks: 'runtimeOnly'},
    'no-role-presentation-on-focusable': {disableInCodeBlocks: 'runtimeOnly'},
    'no-static-element-interactions': {disableInCodeBlocks: 'runtimeOnly'},
    'role-has-required-aria-props': {disableInCodeBlocks: 'runtimeOnly'},
    'tabindex-no-positive': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
