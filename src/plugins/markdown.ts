import {definePluginMetadata} from './shared';

export default definePluginMetadata('markdown', {
  configs: ['markdown'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/eslint/markdown/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint/markdown/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'fenced-code-meta': {disableInCodeBlocks: 'tooStrict'},
    'heading-increment': {disableInCodeBlocks: 'fragment'},
    'no-bare-urls': {disableInCodeBlocks: 'alternatives'},
    'no-duplicate-headings': {disableInCodeBlocks: 'fragment'},
    'no-html': {disableInCodeBlocks: 'alternatives'},
    'no-missing-atx-heading-space': {
      autofixDisabled: [
        true,
        'a paragraph starting with `#`, like `#123 is fixed`, becomes a heading',
      ],
    },
    'no-missing-label-refs': {disableInCodeBlocks: 'fragment'},
    'no-missing-link-fragments': {disableInCodeBlocks: 'fragment'},
    'no-multiple-h1': {disableInCodeBlocks: 'fragment'},
    'no-space-in-emphasis': {
      autofixDisabled: [true, 'asterisks used as text, like in `2 * 3 * 4`, become emphasis'],
    },
    'no-unused-definitions': {disableInCodeBlocks: 'unused'},
    'require-alt-text': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
