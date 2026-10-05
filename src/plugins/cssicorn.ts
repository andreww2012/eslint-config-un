import {definePluginMetadata} from './shared';

export default definePluginMetadata('cssicorn', {
  configs: ['css'],
  docsUrl: 'https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/readme.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/sindresorhus/eslint-cssicorn/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    lowercase: {stylistic: true},
    'no-duplicate-font-family-names': {
      stylistic: [
        false,
        'a duplicate is often a copy-pasted name in place of the intended fallback, and removing the second `monospace` of the `monospace, monospace` hack changes the font size',
      ],
    },
    'no-redundant-longhand-properties': {
      stylistic: [
        false,
        'the fix also replaces an earlier shorthand of the same block, which may be a fallback for browsers not supporting the longhand values',
      ],
    },
    'no-redundant-nested-style-rules': {stylistic: true},
    'no-redundant-shorthand-values': {stylistic: true},
    'no-zero-length-unit': {stylistic: true},
    'prefer-media-feature-range-syntax': {stylistic: true},
    'prefer-modern-syntax': {stylistic: true},
    'prefer-short-hex-color': {stylistic: true},
  },
});
