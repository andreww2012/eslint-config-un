import {definePluginMetadata} from './shared';

export default definePluginMetadata('css', {
  configs: ['css'],
  isMainPlugin: true,
  docsUrl: 'https://github.com/eslint/css/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => `https://github.com/eslint/css/blob/HEAD/docs/rules/${ruleName}.md`,
  gitTag: (version) => `css-v${version}`,
  rules: {
    'font-family-fallbacks': {disableInCodeBlocks: 'runtimeOnly'},
    'no-duplicate-imports': {
      disableInCodeBlocks: [
        false,
        'unlike core `no-duplicate-imports`, it flags one stylesheet loaded twice by `@import`, not alternative import styles',
      ],
    },
    'no-empty-blocks': {disableInCodeBlocks: 'emptiness'},
    'no-important': {disableInCodeBlocks: 'tooStrict'},
    'prefer-logical-properties': {disableInCodeBlocks: 'runtimeOnly'},
    'relative-font-units': {disableInCodeBlocks: 'runtimeOnly'},
    'use-baseline': {disableInCodeBlocks: 'runtimeOnly'},
    'use-layers': {disableInCodeBlocks: 'tooStrict'},
  },
});
