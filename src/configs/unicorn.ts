import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import {ERROR, OFF, WARNING} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface UnicornEslintConfigOptions extends ConfigSharedOptions<'unicorn'> {}

export const unicornUnConfig: UnConfigFn<'unicorn'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.unicorn;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies UnicornEslintConfigOptions);

  const configBuilder = new ConfigEntryBuilder('unicorn', optionsResolved, context);

  // LEGEND:
  // 🔴 - not in recommended

  configBuilder
    .addConfig(['unicorn', {includeDefaultFilesAndIgnores: true}])
    .addBulkRules(eslintPluginUnicorn.configs['flat/recommended'].rules)
    // .addRule('better-regex', ERROR)
    .addRule('catch-error-name', OFF)
    .addRule('catch-error-name', WARNING, [], {disableAutofix: true})
    .addRule('consistent-assert', WARNING) // >=57.0.0
    // .addRule('consistent-date-clone', ERROR) // >=57.0.0
    // .addRule('consistent-destructuring', OFF) // 🔴
    // .addRule('consistent-empty-array-spread', ERROR)
    .addRule('consistent-existence-index-check', ERROR, [], {disableAutofix: true})
    // .addRule('consistent-function-scoping', ERROR)
    .addRule('custom-error-definition', ERROR) // 🔴
    // .addRule('empty-brace-spaces', ERROR) // 💅
    // .addRule('error-message', ERROR)
    // .addRule('escape-case', ERROR)
    // .addRule('expiring-todo-comments', ERROR)
    // Reason for disabling autofix: wrong auto-fixes
    .addRule('explicit-length-check', ERROR, [], {disableAutofix: true})
    .addRule('filename-case', OFF)
    // .addRule('import-style', ERROR)
    // .addRule('new-for-builtins', ERROR)
    // .addRule('no-abusive-eslint-disable', ERROR)
    // .addRule('no-accessor-recursion', ERROR) // >=57.0.0
    .addRule('no-anonymous-default-export', OFF) // Note: there's the same rule in import plugin
    .addRule('no-array-callback-reference', OFF)
    .addRule('no-array-for-each', OFF)
    // .addRule('no-array-method-this-argument', ERROR)
    // .addRule('prefer-single-call', ERROR)
    .addRule('no-array-reduce', OFF)
    .addRule('no-await-expression-member', OFF)
    // .addRule('no-await-in-promise-methods', ERROR)
    // .addRule('no-console-spaces', ERROR)
    // .addRule('no-document-cookie', ERROR)
    // .addRule('no-empty-file', ERROR)
    .addRule('no-for-loop', OFF)
    // .addRule('no-hex-escape', ERROR)
    // .addRule('no-instanceof-builtins', ERROR) // >=57.0.0
    // .addRule('no-invalid-fetch-options', ERROR)
    // .addRule('no-invalid-remove-event-listener', ERROR)
    // .addRule('no-keyword-prefix', OFF) // 🔴
    // .addRule('no-unnecessary-slice-end', ERROR)
    // .addRule('no-lonely-if', ERROR)
    // Passing `Infinity` doesn't work great with TypeScript
    .addRule('no-magic-array-flat-depth', OFF)
    // .addRule('no-named-default', ERROR) // >=57.0.0
    // "This is an improved version of the no-negated-condition ESLint rule that makes it automatically fixable" - Unicorn docs
    .addRule('no-negated-condition', ERROR, [], {overrideBaseRule: true})
    // .addRule('no-negation-in-equality-check', ERROR)
    .addRule('no-nested-ternary', OFF)
    // .addRule('no-new-array', ERROR)
    // .addRule('no-new-buffer', ERROR)
    .addRule('no-null', OFF)
    // .addRule('no-object-as-default-parameter', ERROR)
    .addRule('no-process-exit', OFF) // Used in `node` config
    // .addRule('no-single-promise-in-promise-methods', ERROR)
    // .addRule('no-static-only-class', ERROR)
    // .addRule('no-thenable', ERROR)
    // .addRule('no-this-assignment', ERROR)
    // .addRule('no-typeof-undefined', ERROR)
    // .addRule('no-unnecessary-array-flat-depth', ERROR)
    // .addRule('no-unnecessary-array-splice-count', ERROR)
    // .addRule('no-unnecessary-await', ERROR)
    // .addRule('no-unnecessary-polyfills', ERROR)
    .addRule('no-unreadable-array-destructuring', OFF)
    // .addRule('no-unreadable-iife', ERROR)
    // .addRule('no-unused-properties', OFF) // 🔴
    // .addRule('no-useless-fallback-in-spread', ERROR)
    // .addRule('no-useless-length-check', ERROR)
    // .addRule('no-useless-promise-resolve-reject', ERROR)
    // .addRule('no-useless-spread', ERROR)
    // .addRule('no-useless-switch-case', ERROR)
    // TODO reason for disabling autofix
    .addRule('no-useless-undefined', ERROR, [{checkArguments: false}], {
      disableAutofix: true,
    })
    // .addRule('no-zero-fractions', ERROR)
    // .addRule('number-literal-case', ERROR)
    .addRule('numeric-separators-style', ERROR, [{onlyIfContainsSeparator: true}])
    // .addRule('prefer-add-event-listener', ERROR)
    // .addRule('prefer-array-find', ERROR)
    // .addRule('prefer-array-flat-map', ERROR)
    // .addRule('prefer-array-flat', ERROR)
    // .addRule('prefer-array-index-of', ERROR)
    // .addRule('prefer-array-some', ERROR)
    // .addRule('prefer-at', ERROR)
    // .addRule('prefer-blob-reading-methods', ERROR)
    // .addRule('prefer-code-point', ERROR)
    // .addRule('prefer-date-now', ERROR)
    // .addRule('prefer-default-parameters', ERROR)
    // .addRule('prefer-dom-node-append', ERROR)
    // .addRule('prefer-dom-node-dataset', ERROR)
    // .addRule('prefer-dom-node-remove', ERROR)
    .addRule('prefer-dom-node-text-content', OFF)
    // .addRule('prefer-event-target', ERROR)
    .addRule('prefer-export-from', ERROR, [{ignoreUsedVariables: true}])
    .addRule('prefer-global-this', OFF) // >=56.0.0
    // .addRule('prefer-import-meta-properties', OFF) // 🔴 used in `node` config
    // .addRule('prefer-includes', ERROR)
    // .addRule('prefer-json-parse-buffer', ERROR)
    // .addRule('prefer-keyboard-event-key', ERROR)
    // .addRule('prefer-logical-operator-over-ternary', ERROR)
    // .addRule('prefer-math-min-max', ERROR) // >=56.0.0
    // .addRule('prefer-math-trunc', ERROR)
    // .addRule('prefer-modern-dom-apis', ERROR)
    // .addRule('prefer-modern-math-apis', ERROR)
    .addRule('prefer-module', OFF)
    // .addRule('prefer-native-coercion-functions', ERROR)
    // .addRule('prefer-negative-index', ERROR)
    .addRule('prefer-node-protocol', OFF) // `n/prefer-node-protocol` seem to be better as it checks supported node versions
    .addRule('prefer-number-properties', ERROR, [{checkInfinity: true}])
    // .addRule('prefer-object-from-entries', ERROR)
    // .addRule('prefer-optional-catch-binding', ERROR)
    // .addRule('prefer-prototype-methods', ERROR)
    .addRule('prefer-query-selector', OFF)
    // .addRule('prefer-reflect-apply', ERROR)
    // TODO disable when regexp is enabled?
    // .addRule('prefer-regexp-test', ERROR)
    // .addRule('prefer-set-has', ERROR)
    // .addRule('prefer-set-size', ERROR)
    .addRule('prefer-spread', ERROR, [], {disableAutofix: true})
    // .addRule('prefer-string-raw', ERROR)
    // .addRule('prefer-string-replace-all', ERROR)
    // .addRule('prefer-string-slice', ERROR)
    // .addRule('prefer-string-starts-ends-with', ERROR)
    // .addRule('prefer-string-trim-start-end', ERROR)
    // .addRule('prefer-structured-clone', ERROR)
    .addRule('prefer-switch', ERROR, [{minimumCases: 4, emptyDefaultCase: 'do-nothing-comment'}])
    // .addRule('prefer-ternary', ERROR)
    // .addRule('prefer-top-level-await', ERROR)
    // .addRule('prefer-type-error', ERROR)
    .addRule('prevent-abbreviations', OFF)
    .addRule('relative-url-style', ERROR, ['always'])
    // .addRule('require-array-join-separator', ERROR)
    // .addRule('require-number-to-fixed-digits-argument', ERROR)
    // .addRule('require-post-message-target-origin', OFF) // 🔴
    // .addRule('string-content', OFF) // 🔴
    // .addRule('switch-case-braces', ERROR)
    // .addRule('template-indent', ERROR)
    // .addRule('text-encoding-identifier-case', ERROR)
    // .addRule('throw-new-error', ERROR)
    .addOverrides();

  return {
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};
