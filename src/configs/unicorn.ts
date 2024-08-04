import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import {ERROR, OFF} from '../constants';
import type {ConfigSharedOptions, FlatConfigEntry, InternalConfigOptions} from '../types';
import {disableAutofixForRule, genFlatConfigEntryName, warnUnlessForcedError} from '../utils';

export interface UnicornEslintConfigOptions extends ConfigSharedOptions<`unicorn/${string}`> {}

export const unicornEslintConfig = (
  options: UnicornEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  // LEGEND:
  // 🔴 - not in recommended
  const rules: FlatConfigEntry['rules'] = {
    // 'unicorn/better-regex': ERROR,
    'unicorn/catch-error-name': OFF,
    ...warnUnlessForcedError(internalOptions, 'disable-autofix/unicorn/catch-error-name'),
    // 'unicorn/catch-error-name': ERROR, // TODO warning & disable autofix?
    // 'unicorn/consistent-destructuring': OFF, // 🔴
    // 'unicorn/consistent-empty-array-spread': ERROR,
    // 'unicorn/consistent-function-scoping': ERROR,
    'unicorn/custom-error-definition': ERROR, // 🔴
    // 'unicorn/empty-brace-spaces': ERROR, // 💅
    // 'unicorn/error-message': ERROR,
    // 'unicorn/escape-case': ERROR,
    // 'unicorn/expiring-todo-comments': ERROR,
    // Reason for disabling autofix: wrong auto-fixes
    ...disableAutofixForRule('unicorn/explicit-length-check', ERROR),
    'unicorn/filename-case': OFF,
    // 'unicorn/import-style': ERROR,
    // 'unicorn/new-for-builtins': ERROR,
    // 'unicorn/no-abusive-eslint-disable': ERROR,
    'unicorn/no-anonymous-default-export': OFF, // Note: there's the same rule in import plugin
    'unicorn/no-array-callback-reference': OFF,
    'unicorn/no-array-for-each': OFF,
    // 'unicorn/no-array-method-this-argument': ERROR,
    // 'unicorn/no-array-push-push': ERROR,
    'unicorn/no-array-reduce': OFF,
    'unicorn/no-await-expression-member': OFF,
    // 'unicorn/no-await-in-promise-methods': ERROR,
    // 'unicorn/no-console-spaces': ERROR,
    // 'unicorn/no-document-cookie': ERROR,
    // 'unicorn/no-empty-file': ERROR,
    'unicorn/no-for-loop': OFF,
    // 'unicorn/no-hex-escape': ERROR,
    // 'unicorn/no-instanceof-array': ERROR,
    // 'unicorn/no-invalid-fetch-options': ERROR,
    // 'unicorn/no-invalid-remove-event-listener': ERROR,
    // 'unicorn/no-keyword-prefix': OFF, // 🔴
    // 'unicorn/no-length-as-slice-end': OFF,
    // 'unicorn/no-lonely-if': ERROR,
    // Passing `Infinity` doesn't work great with TypeScript
    'unicorn/no-magic-array-flat-depth': OFF,
    // "This is an improved version of the no-negated-condition ESLint rule that makes it automatically fixable" - Unicorn docs
    // 'no-negated-condition': OFF,
    // 'unicorn/no-negated-condition': ERROR,
    // 'unicorn/no-negation-in-equality-check': ERROR,
    'unicorn/no-nested-ternary': OFF,
    // 'unicorn/no-new-array': ERROR,
    // 'unicorn/no-new-buffer': ERROR,
    'unicorn/no-null': OFF,
    // 'unicorn/no-object-as-default-parameter': ERROR,
    'unicorn/no-process-exit': OFF, // Used in `node` config
    // 'unicorn/no-single-promise-in-promise-methods': ERROR,
    // 'unicorn/no-static-only-class': ERROR,
    // 'unicorn/no-thenable': ERROR,
    // 'unicorn/no-this-assignment': ERROR,
    // 'unicorn/no-typeof-undefined': ERROR,
    // 'unicorn/no-unnecessary-await': ERROR,
    // 'unicorn/no-unnecessary-polyfills': ERROR,
    'unicorn/no-unreadable-array-destructuring': OFF,
    // 'unicorn/no-unreadable-iife': ERROR,
    // 'unicorn/no-unused-properties': OFF, // 🔴
    // 'unicorn/no-useless-fallback-in-spread': ERROR,
    // 'unicorn/no-useless-length-check': ERROR,
    // 'unicorn/no-useless-promise-resolve-reject': ERROR,
    // 'unicorn/no-useless-spread': ERROR,
    // 'unicorn/no-useless-switch-case': ERROR,
    // TODO reason for disabling autofix
    ...disableAutofixForRule('unicorn/no-useless-undefined', ERROR, {
      checkArguments: false,
    }),
    // 'unicorn/no-zero-fractions': ERROR,
    // 'unicorn/number-literal-case': ERROR,
    'unicorn/numeric-separators-style': [
      ERROR,
      {
        onlyIfContainsSeparator: true,
      },
    ],
    // 'unicorn/prefer-add-event-listener': ERROR,
    // 'unicorn/prefer-array-find': ERROR,
    // 'unicorn/prefer-array-flat-map': ERROR,
    // 'unicorn/prefer-array-flat': ERROR,
    // 'unicorn/prefer-array-index-of': ERROR,
    // 'unicorn/prefer-array-some': ERROR,
    // 'unicorn/prefer-at': ERROR,
    // 'unicorn/prefer-blob-reading-methods': ERROR,
    // 'unicorn/prefer-code-point': ERROR,
    // 'unicorn/prefer-date-now': ERROR,
    // 'unicorn/prefer-default-parameters': ERROR,
    // 'unicorn/prefer-dom-node-append': ERROR,
    // 'unicorn/prefer-dom-node-dataset': ERROR,
    // 'unicorn/prefer-dom-node-remove': ERROR,
    'unicorn/prefer-dom-node-text-content': OFF,
    // 'unicorn/prefer-event-target': ERROR,
    'unicorn/prefer-export-from': [ERROR, {ignoreUsedVariables: true}],
    // 'unicorn/prefer-includes': ERROR,
    // 'unicorn/prefer-json-parse-buffer': ERROR,
    // 'unicorn/prefer-keyboard-event-key': ERROR,
    // 'unicorn/prefer-logical-operator-over-ternary': ERROR,
    // 'unicorn/prefer-math-trunc': ERROR,
    // 'unicorn/prefer-modern-dom-apis': ERROR,
    // 'unicorn/prefer-modern-math-apis': ERROR,
    'unicorn/prefer-module': OFF,
    // 'unicorn/prefer-native-coercion-functions': ERROR,
    // 'unicorn/prefer-negative-index': ERROR,
    'unicorn/prefer-node-protocol': OFF, // `n/prefer-node-protocol` seem to be better as it checks supported node versions
    'unicorn/prefer-number-properties': [ERROR, {checkInfinity: true}],
    // 'unicorn/prefer-object-from-entries': ERROR,
    // 'unicorn/prefer-optional-catch-binding': ERROR,
    // 'unicorn/prefer-prototype-methods': ERROR,
    'unicorn/prefer-query-selector': OFF,
    // 'unicorn/prefer-reflect-apply': ERROR,
    // TODO disable when regexp is enabled?
    // 'unicorn/prefer-regexp-test': ERROR,
    // 'unicorn/prefer-set-has': ERROR,
    // 'unicorn/prefer-set-size': ERROR,
    ...disableAutofixForRule('unicorn/prefer-spread', ERROR),
    // 'unicorn/prefer-string-raw': ERROR,
    // 'unicorn/prefer-string-replace-all': ERROR,
    // 'unicorn/prefer-string-slice': ERROR,
    // 'unicorn/prefer-string-starts-ends-with': ERROR,
    // 'unicorn/prefer-string-trim-start-end': ERROR,
    // 'unicorn/prefer-structured-clone': ERROR,
    'unicorn/prefer-switch': [
      ERROR,
      {
        minimumCases: 4,
        emptyDefaultCase: 'do-nothing-comment',
      },
    ],
    // 'unicorn/prefer-ternary': ERROR,
    // 'unicorn/prefer-top-level-await': ERROR,
    // 'unicorn/prefer-type-error': ERROR,
    'unicorn/prevent-abbreviations': OFF,
    'unicorn/relative-url-style': [ERROR, 'always'],
    // 'unicorn/require-array-join-separator': ERROR,
    // 'unicorn/require-number-to-fixed-digits-argument': ERROR,
    // 'unicorn/require-post-message-target-origin': OFF, // 🔴
    // 'unicorn/string-content': OFF, // 🔴
    // 'unicorn/switch-case-braces': ERROR,
    // 'unicorn/template-indent': ERROR,
    // 'unicorn/text-encoding-identifier-case': ERROR,
    // 'unicorn/throw-new-error': ERROR,
  };

  return [
    {
      ...(options.files && {files: options.files}),
      ...(options.ignores && {ignores: options.ignores}),
      rules: {
        ...eslintPluginUnicorn.configs['flat/recommended'].rules,
        ...rules,
        ...options.overrides,
      },
      name: genFlatConfigEntryName('unicorn'),
    },
  ];
};
