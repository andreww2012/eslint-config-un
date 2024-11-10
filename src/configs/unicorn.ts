import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import {ERROR, OFF, WARNING} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types/eslint';
import {ConfigEntryBuilder} from '../utils';

export interface UnicornEslintConfigOptions extends ConfigSharedOptions<'unicorn'> {}

export const unicornEslintConfig = (
  options: UnicornEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder<'unicorn'>(options, internalOptions);

  // LEGEND:
  // 🔴 - not in recommended

  builder
    .addConfig(['unicorn', {includeDefaultFilesAndIgnores: true}])
    .addBulkRules(eslintPluginUnicorn.configs['flat/recommended'].rules)
    // .addRule('unicorn/better-regex', ERROR)
    .addRule('unicorn/catch-error-name', OFF)
    .addRule('unicorn/catch-error-name', WARNING, [], {disableAutofix: true})
    // .addRule('unicorn/consistent-destructuring', OFF) // 🔴
    // .addRule('unicorn/consistent-empty-array-spread', ERROR)
    .addRule('unicorn/consistent-existence-index-check', ERROR, [], {disableAutofix: true})
    // .addRule('unicorn/consistent-function-scoping', ERROR)
    .addRule('unicorn/custom-error-definition', ERROR) // 🔴
    // .addRule('unicorn/empty-brace-spaces', ERROR) // 💅
    // .addRule('unicorn/error-message', ERROR)
    // .addRule('unicorn/escape-case', ERROR)
    // .addRule('unicorn/expiring-todo-comments', ERROR)
    // Reason for disabling autofix: wrong auto-fixes
    .addRule('unicorn/explicit-length-check', ERROR, [], {disableAutofix: true})
    .addRule('unicorn/filename-case', OFF)
    // .addRule('unicorn/import-style', ERROR)
    // .addRule('unicorn/new-for-builtins', ERROR)
    // .addRule('unicorn/no-abusive-eslint-disable', ERROR)
    .addRule('unicorn/no-anonymous-default-export', OFF) // Note: there's the same rule in import plugin
    .addRule('unicorn/no-array-callback-reference', OFF)
    .addRule('unicorn/no-array-for-each', OFF)
    // .addRule('unicorn/no-array-method-this-argument', ERROR)
    // .addRule('unicorn/no-array-push-push', ERROR)
    .addRule('unicorn/no-array-reduce', OFF)
    .addRule('unicorn/no-await-expression-member', OFF)
    // .addRule('unicorn/no-await-in-promise-methods', ERROR)
    // .addRule('unicorn/no-console-spaces', ERROR)
    // .addRule('unicorn/no-document-cookie', ERROR)
    // .addRule('unicorn/no-empty-file', ERROR)
    .addRule('unicorn/no-for-loop', OFF)
    // .addRule('unicorn/no-hex-escape', ERROR)
    // .addRule('unicorn/no-instanceof-array', ERROR)
    // .addRule('unicorn/no-invalid-fetch-options', ERROR)
    // .addRule('unicorn/no-invalid-remove-event-listener', ERROR)
    // .addRule('unicorn/no-keyword-prefix', OFF) // 🔴
    // .addRule('unicorn/no-length-as-slice-end', OFF)
    // .addRule('unicorn/no-lonely-if', ERROR)
    // Passing `Infinity` doesn't work great with TypeScript
    .addRule('unicorn/no-magic-array-flat-depth', OFF)
    // "This is an improved version of the no-negated-condition ESLint rule that makes it automatically fixable" - Unicorn docs
    .addRule('unicorn/no-negated-condition', ERROR, [], {overrideBaseRule: true})
    // .addRule('unicorn/no-negation-in-equality-check', ERROR)
    .addRule('unicorn/no-nested-ternary', OFF)
    // .addRule('unicorn/no-new-array', ERROR)
    // .addRule('unicorn/no-new-buffer', ERROR)
    .addRule('unicorn/no-null', OFF)
    // .addRule('unicorn/no-object-as-default-parameter', ERROR)
    .addRule('unicorn/no-process-exit', OFF) // Used in `node` config
    // .addRule('unicorn/no-single-promise-in-promise-methods', ERROR)
    // .addRule('unicorn/no-static-only-class', ERROR)
    // .addRule('unicorn/no-thenable', ERROR)
    // .addRule('unicorn/no-this-assignment', ERROR)
    // .addRule('unicorn/no-typeof-undefined', ERROR)
    // .addRule('unicorn/no-unnecessary-await', ERROR)
    // .addRule('unicorn/no-unnecessary-polyfills', ERROR)
    .addRule('unicorn/no-unreadable-array-destructuring', OFF)
    // .addRule('unicorn/no-unreadable-iife', ERROR)
    // .addRule('unicorn/no-unused-properties', OFF) // 🔴
    // .addRule('unicorn/no-useless-fallback-in-spread', ERROR)
    // .addRule('unicorn/no-useless-length-check', ERROR)
    // .addRule('unicorn/no-useless-promise-resolve-reject', ERROR)
    // .addRule('unicorn/no-useless-spread', ERROR)
    // .addRule('unicorn/no-useless-switch-case', ERROR)
    // TODO reason for disabling autofix
    .addRule('unicorn/no-useless-undefined', ERROR, [{checkArguments: false}], {
      disableAutofix: true,
    })
    // .addRule('unicorn/no-zero-fractions', ERROR)
    // .addRule('unicorn/number-literal-case', ERROR)
    .addRule('unicorn/numeric-separators-style', ERROR, [{onlyIfContainsSeparator: true}])
    // .addRule('unicorn/prefer-add-event-listener', ERROR)
    // .addRule('unicorn/prefer-array-find', ERROR)
    // .addRule('unicorn/prefer-array-flat-map', ERROR)
    // .addRule('unicorn/prefer-array-flat', ERROR)
    // .addRule('unicorn/prefer-array-index-of', ERROR)
    // .addRule('unicorn/prefer-array-some', ERROR)
    // .addRule('unicorn/prefer-at', ERROR)
    // .addRule('unicorn/prefer-blob-reading-methods', ERROR)
    // .addRule('unicorn/prefer-code-point', ERROR)
    // .addRule('unicorn/prefer-date-now', ERROR)
    // .addRule('unicorn/prefer-default-parameters', ERROR)
    // .addRule('unicorn/prefer-dom-node-append', ERROR)
    // .addRule('unicorn/prefer-dom-node-dataset', ERROR)
    // .addRule('unicorn/prefer-dom-node-remove', ERROR)
    .addRule('unicorn/prefer-dom-node-text-content', OFF)
    // .addRule('unicorn/prefer-event-target', ERROR)
    .addRule('unicorn/prefer-export-from', ERROR, [{ignoreUsedVariables: true}])
    .addRule('unicorn/prefer-global-this', OFF) // >=56.0.0
    // .addRule('unicorn/prefer-includes', ERROR)
    // .addRule('unicorn/prefer-json-parse-buffer', ERROR)
    // .addRule('unicorn/prefer-keyboard-event-key', ERROR)
    // .addRule('unicorn/prefer-logical-operator-over-ternary', ERROR)
    // .addRule('unicorn/prefer-math-min-max', ERROR) // >=56.0.0
    // .addRule('unicorn/prefer-math-trunc', ERROR)
    // .addRule('unicorn/prefer-modern-dom-apis', ERROR)
    // .addRule('unicorn/prefer-modern-math-apis', ERROR)
    .addRule('unicorn/prefer-module', OFF)
    // .addRule('unicorn/prefer-native-coercion-functions', ERROR)
    // .addRule('unicorn/prefer-negative-index', ERROR)
    .addRule('unicorn/prefer-node-protocol', OFF) // `n/prefer-node-protocol` seem to be better as it checks supported node versions
    .addRule('unicorn/prefer-number-properties', ERROR, [{checkInfinity: true}])
    // .addRule('unicorn/prefer-object-from-entries', ERROR)
    // .addRule('unicorn/prefer-optional-catch-binding', ERROR)
    // .addRule('unicorn/prefer-prototype-methods', ERROR)
    .addRule('unicorn/prefer-query-selector', OFF)
    // .addRule('unicorn/prefer-reflect-apply', ERROR)
    // TODO disable when regexp is enabled?
    // .addRule('unicorn/prefer-regexp-test', ERROR)
    // .addRule('unicorn/prefer-set-has', ERROR)
    // .addRule('unicorn/prefer-set-size', ERROR)
    .addRule('unicorn/prefer-spread', ERROR, [], {disableAutofix: true})
    // .addRule('unicorn/prefer-string-raw', ERROR)
    // .addRule('unicorn/prefer-string-replace-all', ERROR)
    // .addRule('unicorn/prefer-string-slice', ERROR)
    // .addRule('unicorn/prefer-string-starts-ends-with', ERROR)
    // .addRule('unicorn/prefer-string-trim-start-end', ERROR)
    // .addRule('unicorn/prefer-structured-clone', ERROR)
    .addRule('unicorn/prefer-switch', ERROR, [
      {minimumCases: 4, emptyDefaultCase: 'do-nothing-comment'},
    ])
    // .addRule('unicorn/prefer-ternary', ERROR)
    // .addRule('unicorn/prefer-top-level-await', ERROR)
    // .addRule('unicorn/prefer-type-error', ERROR)
    .addRule('unicorn/prevent-abbreviations', OFF)
    .addRule('unicorn/relative-url-style', ERROR, ['always'])
    // .addRule('unicorn/require-array-join-separator', ERROR)
    // .addRule('unicorn/require-number-to-fixed-digits-argument', ERROR)
    // .addRule('unicorn/require-post-message-target-origin', OFF) // 🔴
    // .addRule('unicorn/string-content', OFF) // 🔴
    // .addRule('unicorn/switch-case-braces', ERROR)
    // .addRule('unicorn/template-indent', ERROR)
    // .addRule('unicorn/text-encoding-identifier-case', ERROR)
    // .addRule('unicorn/throw-new-error', ERROR)
    .addOverrides();

  return builder.getAllConfigs();
};
