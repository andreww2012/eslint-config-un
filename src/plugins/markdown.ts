import {definePluginMetadata} from './shared';

export default definePluginMetadata('markdown', {
  configs: ['markdown'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/eslint/markdown/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint/markdown/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'no-missing-atx-heading-space': {
      autofixDisabled: [
        true,
        'a paragraph starting with `#`, like `#123 is fixed`, becomes a heading',
      ],
    },
    'no-space-in-emphasis': {
      autofixDisabled: [true, 'asterisks used as text, like in `2 * 3 * 4`, become emphasis'],
    },
  },
});
