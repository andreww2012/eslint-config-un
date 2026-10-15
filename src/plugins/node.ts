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
    'callback-return': {disableInCodeBlocks: 'runtimeOnly'},
    'exports-style': {
      disableInCodeBlocks: [false, 'only reads how the snippet itself writes its exports'],
    },
    'file-extension-in-import': {disableInCodeBlocks: 'imports'},
    'global-require': {disableInCodeBlocks: 'runtimeOnly'},
    'handle-callback-err': {disableInCodeBlocks: 'unused'},
    hashbang: {disableInCodeBlocks: 'fileName', cliFiles: 'off'},
    'no-callback-literal': {disableInCodeBlocks: 'runtimeOnly'},
    'no-extraneous-import': {disableInCodeBlocks: 'imports'},
    'no-extraneous-require': {disableInCodeBlocks: 'imports'},
    'no-hide-core-modules': {disableInCodeBlocks: 'imports'},
    'no-missing-import': {disableInCodeBlocks: 'imports'},
    'no-missing-require': {disableInCodeBlocks: 'imports'},
    'no-path-concat': {disableInCodeBlocks: 'runtimeOnly'},
    'no-process-env': {disableInCodeBlocks: 'runtimeOnly'},
    'no-process-exit': {disableInCodeBlocks: 'runtimeOnly', cliFiles: 'off'},
    'no-restricted-import': {disableInCodeBlocks: 'imports'},
    'no-restricted-require': {disableInCodeBlocks: 'imports'},
    'no-sync': {
      requiresTypeInfo: [
        true,
        'asks for the parser services before reading `ignores`, so it throws on the first sync call of any file the TypeScript parser handles without type information',
      ],
    },
    'no-top-level-await': {disableInCodeBlocks: 'runtimeOnly', cliFiles: 'off'},
    'no-unpublished-import': {disableInCodeBlocks: 'imports'},
    'no-unpublished-require': {disableInCodeBlocks: 'imports'},
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
    shebang: {disableInCodeBlocks: 'fileName'},
  },
});
