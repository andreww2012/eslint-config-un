import {definePluginMetadata} from './shared';

export default definePluginMetadata('lit-a11y', {
  configs: ['lit'],
  ruleDocsUrl: (ruleName) =>
    `https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/${ruleName}.md`,
  gitTag: (tag) => `eslint-plugin-lit-a11y@${tag}`,
  rules: {
    'accessible-emoji': {disableInCodeBlocks: 'runtimeOnly'},
    'accessible-name': {disableInCodeBlocks: 'runtimeOnly'},
    'alt-text': {disableInCodeBlocks: 'runtimeOnly'},
    'anchor-is-valid': {disableInCodeBlocks: 'runtimeOnly'},
    'aria-activedescendant-has-tabindex': {disableInCodeBlocks: 'runtimeOnly'},
    'click-events-have-key-events': {disableInCodeBlocks: 'runtimeOnly'},
    'heading-hidden': {disableInCodeBlocks: 'runtimeOnly'},
    'iframe-title': {disableInCodeBlocks: 'runtimeOnly'},
    'img-redundant-alt': {disableInCodeBlocks: 'runtimeOnly'},
    'mouse-events-have-key-events': {disableInCodeBlocks: 'runtimeOnly'},
    'no-access-key': {disableInCodeBlocks: 'runtimeOnly'},
    'no-autofocus': {disableInCodeBlocks: 'runtimeOnly'},
    'no-invalid-change-handler': {disableInCodeBlocks: 'runtimeOnly'},
    'no-redundant-role': {disableInCodeBlocks: 'runtimeOnly'},
    'obj-alt': {disableInCodeBlocks: 'runtimeOnly'},
    'role-has-required-aria-attrs': {disableInCodeBlocks: 'runtimeOnly'},
    'tabindex-no-positive': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
