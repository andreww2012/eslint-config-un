import {definePluginMetadata} from './shared';

export default definePluginMetadata('better-tailwindcss', {
  configs: ['betterTailwind'],
  docsUrl: 'https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'enforce-canonical-classes': {stylistic: true},
    'enforce-consistent-class-order': {stylistic: true},
    'enforce-consistent-important-position': {stylistic: true},
    'enforce-consistent-line-wrapping': {stylistic: true},
    'enforce-consistent-variable-syntax': {stylistic: true},
    'enforce-consistent-variant-order': {stylistic: true},
    'enforce-logical-properties': {disableInCodeBlocks: 'runtimeOnly'},
    'enforce-shorthand-classes': {stylistic: true},
    'no-duplicate-classes': {stylistic: true},
    'no-restricted-classes': {disableInCodeBlocks: 'tooStrict'},
    'no-unknown-classes': {disableInCodeBlocks: 'runtimeOnly'},
    'no-unnecessary-whitespace': {stylistic: true},
  },
});
