import {definePluginMetadata} from './shared';

export default definePluginMetadata('node', {
  configs: ['node'],
  docsUrl: 'https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/${ruleName}.md`,
  suggestedPrefix: [
    'n',
    'a fork meant to replace the original plugin, so it keeps the original prefix',
  ],
  rules: {
    'exports-style': {disableInCodeBlocks: [false, 'TODO: reason was not recorded']},
    hashbang: {disableInCodeBlocks: 'runtimeOnly', cliFiles: 'off'},
    'no-extraneous-require': {disableInCodeBlocks: 'imports'},
    'no-missing-import': {disableInCodeBlocks: 'imports'},
    'no-missing-require': {disableInCodeBlocks: 'imports'},
    'no-process-exit': {disableInCodeBlocks: 'runtimeOnly', cliFiles: 'off'},
    'no-sync': {
      requiresTypeInfo: [
        false,
        'only needs type information when `ignores` holds non-string entries, which is not how the config sets it',
      ],
    },
    'no-top-level-await': {disableInCodeBlocks: 'runtimeOnly', cliFiles: 'off'},
    'no-unsupported-features/es-builtins': {disableInCodeBlocks: 'runtimeOnly'},
    'no-unsupported-features/es-syntax': {
      requiresTypeInfo: 'optional',
      disableInCodeBlocks: 'runtimeOnly',
    },
    'no-unsupported-features/node-builtins': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-global/buffer': {stylistic: true},
    'prefer-global/console': {stylistic: true},
    'prefer-global/process': {stylistic: true},
    'prefer-global/text-decoder': {stylistic: true},
    'prefer-global/text-encoder': {stylistic: true},
    'prefer-global/url': {stylistic: true},
    'prefer-global/url-search-params': {stylistic: true},
    'prefer-import/assert-strict': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-node-protocol': {stylistic: true},
    'prefer-process-get-builtin-module': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
