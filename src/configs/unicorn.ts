import {ERROR, OFF, WARNING} from '../constants';
import {partition} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type ConsistentCompoundWordsOptions = GetRuleOptions<
  'unicorn',
  'consistent-compound-words',
  'allUnwrapped'
>;

export interface UnicornEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unicorn'> {
  /**
   * Forces compound words like `password` in identifier names (and possibly,
   * in other places) to be treated as a single word:
   * - `true`: enables the corresponding rule with default options;
   * - `false`: disables it;
   * - `Record<string, string | false>`:
   * Keys are words in the form that should be reported, and values are either:
   *   - *Non-empty string* representing the suggested replacement.
   *     For example, `passWord: 'password'`.
   *   - *Empty string* instructing to ignore this spelling at all.
   *     This might be used to override
   *     [the default replacements list](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/de64ab65b513dbdfe45b8f09d3b12f63f96fb0a3/rules/consistent-compound-words.js#L27).
   *   - `false`: treats the key as a full identifier name and ignores
   *     the corresponding identified completely.
   *     Corresponds to the
   *     [`allowList` rule option](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-compound-words.md#allowlist).
   * - `array`: ESLint-like format of the options, allowing to specify
   * rule options directly. Is an array to distinguish from the object form.
   *
   * Affected rule:
   * - [`unicorn/consistent-compound-words`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-compound-words.md)
   * @default true
   */
  compoundWordsSuggestedReplacements?:
    | boolean
    | Record<string, string | false>
    | ConsistentCompoundWordsOptions;

  /**
   * What DOM API to enforce when working with `data-` attributes:
   * - `dataset`: use
   * [the `.dataset` API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset);
   * - `attributes`: use `{get,set,remove,has}Attribute`;
   * - `false`: do not enforce the style.
   *
   * Affected rule:
   * - [`unicorn/dom-node-dataset`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/dom-node-dataset.md)
   * @default 'dataset'
   */
  domDataAttributesStyle?: false | 'dataset' | 'attributes';

  /**
   * Enforces `utf8`/`utf-8` and `ascii` for UTF-8 and ASCII encodings respectively
   * in function arguments, such as `fs.readFile(file, 'utf8')`.
   * - `'no-dash'`: enforce lower case and the dash-less variant for UTF-8 encoding.
   * - `'dash'`: enforce lower case and the variant with a dash for UTF-8 encoding.
   * - `false`: do not enforce anything.
   *
   * Affected rule:
   * - [`unicorn/text-encoding-identifier-case`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/text-encoding-identifier-case.md)
   * @default 'no-dash'
   */
  enforceTextEncodingCaseAndNotation?: 'no-dash' | 'dash' | false;

  /**
   * Whether comparing the same expression to different values multiple times
   * should be reported:
   * - `value === 'a' || value === 'b' || value === 'c'` ->
   * `['a', 'b', 'c'].includes(value)`.
   *
   * Specifying values below 2 *disables* the affected rule.
   *
   * Affected rule:
   * - [`unicorn/prefer-includes-over-repeated-comparisons`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-includes-over-repeated-comparisons.md)
   * @default 3
   */
  minimumComparisonsToPreferArrayIncludes?: number;

  /**
   * Whether multiple consecutive whitespace characters should be reported
   * and autofixed to `'<character'.repeat(<times>)`:
   * - `const indentation = '    ';` ->
   * `const indentation = ' '.repeat(4);`.
   *
   * Specifying values below 2 *disables* the affected rule.
   *
   * Affected rule:
   * - [`unicorn/prefer-string-repeat`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-string-repeat.md)
   * @default 3
   */
  minimumWhitespaceRepetitionsToPreferStringRepeat?: number;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    compoundWordsSuggestedReplacements: true,
    domDataAttributesStyle: 'dataset',
    enforceTextEncodingCaseAndNotation: 'no-dash',
    minimumComparisonsToPreferArrayIncludes: 3,
    minimumWhitespaceRepetitionsToPreferStringRepeat: 3,
  });

  const {
    compoundWordsSuggestedReplacements,
    domDataAttributesStyle,
    enforceTextEncodingCaseAndNotation,
    minimumComparisonsToPreferArrayIncludes,
    minimumWhitespaceRepetitionsToPreferStringRepeat,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unicorn');

  // Legend:
  // 🔴 - NOT in recommended & unopinionated
  // 🟣 - NOT in unopinionated
  // 🟠 - rule from `eslint-config-prettier`

  configBuilder
    ?.addConfig([
      'unicorn',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .addRule('better-dom-traversing', ERROR) /** @since 65.0.0 */
    .addRule('catch-error-name', WARNING) /** @since 0.4.0 */ // 🟣
    .addRule('consistent-assert', WARNING) /** @since 57.0.0 */ // 🟣
    .addRule(
      'consistent-compound-words',
      compoundWordsSuggestedReplacements ? ERROR : OFF,
      Array.isArray(compoundWordsSuggestedReplacements)
        ? compoundWordsSuggestedReplacements
        : typeof compoundWordsSuggestedReplacements === 'object'
          ? ((): ConsistentCompoundWordsOptions => {
              const [replacementsArray, allowListArray] = partition(
                Object.entries(compoundWordsSuggestedReplacements),
                ([, value]) => value !== false,
              );
              return [
                {
                  ...(replacementsArray.length > 0 && {
                    replacements: Object.fromEntries(
                      replacementsArray.map(([key, value]) => [key, value || false]),
                    ),
                  }),
                  ...(allowListArray.length > 0 && {
                    allowList: Object.fromEntries(allowListArray.map(([key]) => [key, true])),
                  }),
                },
              ];
            })()
          : [],
    ) /** @since 65.0.0 */
    .addRule('consistent-date-clone', ERROR) /** @since 57.0.0 */
    .addRule('consistent-destructuring', OFF) /** @since 26.0.0 */ // 🔴
    .addRule('consistent-empty-array-spread', ERROR) /** @since 53.0.0 */ // 🟣
    .addRule('consistent-existence-index-check', ERROR) /** @since 56.0.0 */
    .addRule('consistent-function-scoping', ERROR) /** @since 11.0.0 */ // 🟣
    .addRule('consistent-json-file-read', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('consistent-template-literal-escape', ERROR) /** @since 64.0.0 */ // 🟣
    .addRule('custom-error-definition', ERROR) /** @since 2.0.0 */ // 🔴
    .addRule(
      'dom-node-dataset',
      domDataAttributesStyle ? ERROR : OFF,
      domDataAttributesStyle ? [{preferAttributes: domDataAttributesStyle === 'attributes'}] : [],
    ) /** @since 65.0.0 */
    .addRule('empty-brace-spaces', OFF) /** @since 24.0.0 */ // 🟣🟠
    .addRule('error-message', ERROR) /** @since 4.0.0 */
    .addRule('escape-case', ERROR) /** @since 2.0.0 */
    .addRule('expiring-todo-comments', ERROR) /** @since 11.0.0 */
    .addRule('explicit-length-check', ERROR) /** @since 1.0.0 */ // 🟣
    .addRule('filename-case', OFF) /** @since 0.3.0 */ // 🟣
    .addRule('import-style', ERROR) /** @since 22.0.0 */
    .addRule('isolated-functions', OFF) /** @since 63.0.0 */
    .addRule('new-for-builtins', ERROR) /** @since 3.0.0 */
    .addRule('no-abusive-eslint-disable', ERROR) /** @since 0.5.0 */
    .addRule('no-accessor-recursion', ERROR) /** @since 57.0.0 */
    .addRule('no-anonymous-default-export', OFF) /** @since 52.0.0 */ // Note: there's the same rule in import plugin
    .addRule(
      'no-array-callback-reference',
      OFF,
    ) /** @since 3.0.0 */ /** @aka no-fn-reference-in-iterator */ // 🟣
    .addRule('no-array-fill-with-reference-type', ERROR) /** @since 65.0.0 */
    .addRule('no-array-for-each', OFF) /** @since 27.0.0 */
    .addRule('no-array-from-fill', ERROR) /** @since 65.0.0 */
    .addRule('no-array-method-this-argument', ERROR) /** @since 34.0.0 */
    .addRule('no-array-reduce', OFF) /** @since 20.0.0 */ /** @aka no-reduce */ // 🟣
    .addRule('no-array-reverse', ERROR) /** @since 60.0.0 */
    .addRule('no-array-sort', ERROR) /** @since 61.0.0 */
    .addRule('no-await-expression-member', OFF) /** @since 39.0.0 */ // 🟣
    .addRule('no-await-in-promise-methods', ERROR) /** @since 52.0.0 */
    .addRule('no-blob-to-file', ERROR) /** @since 65.0.0 */
    .addRule('no-canvas-to-image', ERROR) /** @since 65.0.0 */
    .addRule('no-confusing-array-splice', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-console-spaces', ERROR) /** @since 7.0.0 */
    .addRule('no-document-cookie', ERROR) /** @since 32.0.0 */
    .addRule('no-duplicate-set-values', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-empty-file', ERROR) /** @since 38.0.0 */
    .addRule('no-exports-in-scripts', ERROR) /** @since 65.0.0 */
    .addRule('no-for-loop', OFF) /** @since 8.0.0 */ // 🟣
    .addRule('no-hex-escape', ERROR) /** @since 2.0.0 */
    .addRule('no-immediate-mutation', ERROR) /** @since 62.0.0 */
    .addRule('no-incorrect-query-selector', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-instanceof-builtins', ERROR) /** @since 57.0.0 */
    .addRule('no-invalid-fetch-options', ERROR) /** @since 53.0.0 */
    // Note: also works on html
    .addRule('no-invalid-file-input-accept', ERROR) /** @since 65.0.0 */
    .addRule('no-invalid-remove-event-listener', ERROR) /** @since 36.0.0 */
    .addRule('no-keyword-prefix', OFF) /** @since 10.0.0 */ // 🔴
    .addRule('no-late-current-target-access', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-lonely-if', ERROR) /** @since 24.0.0 */
    // Passing `Infinity` doesn't work great with TypeScript
    .addRule('no-magic-array-flat-depth', OFF) /** @since 53.0.0 */
    .addRule('no-manually-wrapped-comments', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('no-named-default', ERROR) /** @since 57.0.0 */
    // "This is an improved version of the no-negated-condition ESLint rule that makes it automatically fixable" - Unicorn docs
    .addRule('no-negated-condition', ERROR) /** @since 45.0.0 */
    .disableAnyRule('', 'no-negated-condition')
    .addRule('no-negation-in-equality-check', ERROR) /** @since 54.0.0 */
    .addRule('no-nested-ternary', OFF) /** @since 11.0.0 */ // 🟣🟠
    .addRule('no-new-array', ERROR) /** @since 26.0.0 */
    .addRule('no-new-buffer', ERROR) /** @since 2.0.0 */
    .addRule('no-null', OFF) /** @since 19.0.0 */ // 🟣
    .addRule('no-object-as-default-parameter', ERROR) /** @since 21.0.0 */
    .addRule('no-process-exit', OFF) /** @since 0.2.0 */ // Used in `node` config
    .addRule('no-single-promise-in-promise-methods', ERROR) /** @since 52.0.0 */
    .addRule('no-static-only-class', ERROR) /** @since 29.0.0 */
    .addRule('no-thenable', ERROR) /** @since 40.0.0 */
    .addRule('no-this-assignment', ERROR) /** @since 27.0.0 */
    .addRule('no-this-outside-of-class', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('no-typeof-undefined', ERROR) /** @since 45.0.0 */
    .addRule('no-unnecessary-array-flat-depth', ERROR) /** @since 59.0.0 */
    .addRule('no-unnecessary-array-splice-count', ERROR) /** @since 59.0.0 */
    .addRule('no-unnecessary-await', ERROR) /** @since 44.0.0 */
    .addRule('no-unnecessary-nested-ternary', ERROR) /** @since 65.0.0 */
    .addRule('no-unnecessary-polyfills', ERROR) /** @since 50.0.0 */
    .addRule(
      'no-unnecessary-slice-end',
      ERROR,
    ) /** @since 55.0.0 */ /** @aka no-length-as-slice-end */
    .addRule('no-unreadable-array-destructuring', OFF) /** @since 7.0.0 */
    .addRule('no-unreadable-iife', ERROR) /** @since 42.0.0 */
    .addRule('no-unused-array-method-return', ERROR) /** @since 65.0.0 */
    .addRule('no-unused-properties', OFF) /** @since 7.0.0 */ // 🔴
    .addRule('no-useless-collection-argument', ERROR) /** @since 62.0.0 */
    .addRule('no-useless-error-capture-stack-trace', ERROR) /** @since 60.0.0 */
    .addRule('no-useless-fallback-in-spread', ERROR) /** @since 36.0.0 */
    .addRule('no-useless-iterator-to-array', ERROR) /** @since 64.0.0 */
    .addRule('no-useless-length-check', ERROR) /** @since 35.0.0 */
    .addRule('no-useless-promise-resolve-reject', ERROR) /** @since 40.0.0 */
    .addRule('no-useless-spread', ERROR) /** @since 35.0.0 */
    .addRule('no-useless-switch-case', ERROR) /** @since 42.0.0 */
    .addRule('no-useless-undefined', ERROR, [
      {checkArguments: false, checkArrowFunctionBody: false},
    ]) /** @since 20.0.0 */
    .addRule('no-zero-fractions', ERROR) /** @since 8.0.0 */
    .addRule('number-literal-case', OFF) /** @since 2.0.0 */ // 🟠
    .addRule('numeric-separators-style', ERROR, [
      {onlyIfContainsSeparator: true},
    ]) /** @since 23.0.0 */
    .addRule('prefer-add-event-listener', ERROR) /** @since 4.0.0 */
    .addRule('prefer-array-find', ERROR) /** @since 21.0.0 */
    .addRule('prefer-array-flat', ERROR) /** @since 29.0.0 */
    .addRule('prefer-array-flat-map', ERROR) /** @since 9.0.0 */ /** @aka prefer-flat-map */
    .addRule('prefer-array-index-of', ERROR) /** @since 26.0.0 */
    .addRule('prefer-array-last-methods', ERROR) /** @since 65.0.0 */
    .addRule('prefer-array-some', ERROR) /** @since 25.0.0 */
    .addRule('prefer-at', ERROR) /** @since 34.0.0 */
    .addRule('prefer-bigint-literals', ERROR) /** @since 61.0.0 */
    .addRule('prefer-blob-reading-methods', ERROR) /** @since 47.0.0 */
    .addRule('prefer-class-fields', ERROR) /** @since 60.0.0 */
    .addRule('prefer-classlist-toggle', ERROR) /** @since 61.0.0 */
    .addRule('prefer-code-point', ERROR) /** @since 39.0.0 */
    .addRule('prefer-date-now', ERROR) /** @since 24.0.0 */
    .addRule('prefer-default-parameters', ERROR) /** @since 25.0.0 */
    .addRule('prefer-dom-node-append', ERROR) /** @since 7.0.0 */ /** @aka prefer-node-append */
    .addRule('prefer-dom-node-remove', ERROR) /** @since 8.0.0 */ /** @aka prefer-node-remove */
    .addRule(
      'prefer-dom-node-text-content',
      OFF,
    ) /** @since 8.0.0 */ /** @aka prefer-text-content */
    .addRule('prefer-event-target', ERROR) /** @since 43.0.0 */
    .addRule('prefer-export-from', ERROR, [{}]) /** @since 38.0.0 */ // 🟣
    .addRule('prefer-get-or-insert-computed', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('prefer-global-this', OFF) /** @since 56.0.0 */
    .addRule('prefer-https', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('prefer-import-meta-properties', OFF) /** @since 59.0.0 */ // 🔴 used in `node` config
    .addRule('prefer-includes', ERROR) /** @since 8.0.0 */
    .addRule(
      'prefer-includes-over-repeated-comparisons',
      minimumComparisonsToPreferArrayIncludes > 1 ? ERROR : OFF,
      minimumComparisonsToPreferArrayIncludes > 1
        ? [{minimumComparisons: minimumComparisonsToPreferArrayIncludes}]
        : [],
    ) /** @since 65.0.0 */
    // Reason for disabling: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2565
    .addRule('prefer-iterator-concat', OFF) /** @since 65.0.0 */ // 🔴
    .addRule('prefer-iterator-to-array-at-end', ERROR) /** @since 65.0.0 */
    .addRule('prefer-keyboard-event-key', ERROR) /** @since 9.0.0 */ /** @aka prefer-event-key */
    .addRule('prefer-logical-operator-over-ternary', ERROR) /** @since 43.0.0 */
    .addRule('prefer-math-abs', ERROR) /** @since 65.0.0 */
    .addRule('prefer-math-min-max', ERROR) /** @since 56.0.0 */
    .addRule('prefer-math-trunc', ERROR) /** @since 23.0.0 */
    .addRule('prefer-modern-dom-apis', ERROR) /** @since 15.0.0 */
    .addRule('prefer-modern-math-apis', ERROR) /** @since 42.0.0 */
    .addRule('prefer-module', OFF) /** @since 31.0.0 */
    .addRule('prefer-native-coercion-functions', ERROR) /** @since 42.0.0 */
    .addRule('prefer-negative-index', ERROR) /** @since 14.0.0 */
    .addRule('prefer-node-protocol', OFF) /** @since 31.0.0 */ // `n/prefer-node-protocol` seem to be better as it checks supported node versions
    .addRule('prefer-number-properties', ERROR, [{checkInfinity: true}]) /** @since 18.0.0 */
    .addRule('prefer-object-from-entries', ERROR) /** @since 35.0.0 */
    .addRule('prefer-optional-catch-binding', ERROR) /** @since 20.0.0 */
    .addRule('prefer-prototype-methods', ERROR) /** @since 33.0.0 */
    .addRule('prefer-query-selector', OFF) /** @since 7.0.0 */ // 🟣
    .addRule('prefer-queue-microtask', ERROR) /** @since 65.0.0 */
    .addRule('prefer-reflect-apply', ERROR) /** @since 11.0.0 */
    .addRule('prefer-regexp-test', ERROR) /** @since 26.0.0 */ // TODO disable when regexp is enabled?
    .addRule('prefer-response-static-json', ERROR) /** @since 62.0.0 */
    .addRule('prefer-set-has', ERROR) /** @since 18.0.0 */
    .addRule('prefer-set-size', ERROR) /** @since 45.0.0 */
    .addRule('prefer-simple-condition-first', ERROR) /** @since 64.0.0 */
    .addRule('prefer-single-call', ERROR) /** @since 27.0.0 */ /** @aka no-array-push-push */
    .addRule('prefer-split-limit', ERROR) /** @since 65.0.0 */
    .addRule('prefer-spread', ERROR) /** @since 4.0.0 */ // 🟣
    .addRule('prefer-string-match-all', ERROR) /** @since 65.0.0 */
    .addRule('prefer-string-pad-start-end', ERROR) /** @since 65.0.0 */
    .addRule('prefer-string-raw', ERROR) /** @since 53.0.0 */
    .addRule(
      'prefer-string-repeat',
      minimumWhitespaceRepetitionsToPreferStringRepeat > 1 ? ERROR : OFF,
      minimumWhitespaceRepetitionsToPreferStringRepeat > 1
        ? [{minimumRepetitions: minimumWhitespaceRepetitionsToPreferStringRepeat}]
        : [],
    ) /** @since 65.0.0 */
    .addRule('prefer-string-replace-all', ERROR) /** @since 16.0.0 */ /** @aka prefer-replace-all */
    .addRule('prefer-string-slice', ERROR) /** @since 12.0.0 */
    .addRule(
      'prefer-string-starts-ends-with',
      ERROR,
    ) /** @since 2.0.0 */ /** @aka prefer-starts-ends-with */
    .addRule(
      'prefer-string-trim-start-end',
      ERROR,
    ) /** @since 14.0.0 */ /** @aka prefer-trim-start-end */
    .addRule('prefer-structured-clone', ERROR) /** @since 53.0.0 */
    .addRule('prefer-switch', ERROR, [
      {minimumCases: 4, emptyDefaultCase: 'do-nothing-comment'},
    ]) /** @since 30.0.0 */
    .addRule('prefer-ternary', ERROR) /** @since 23.0.0 */
    .addRule('prefer-top-level-await', OFF) /** @since 34.0.0 */
    .addRule('prefer-type-error', ERROR) /** @since 2.0.0 */
    .addRule('prevent-abbreviations', OFF) /** @since 8.0.0 */ // 🟣
    .addRule('relative-url-style', ERROR, ['always']) /** @since 40.0.0 */
    .addRule('require-array-join-separator', ERROR) /** @since 33.0.0 */
    .addRule('require-css-escape', ERROR) /** @since 65.0.0 */
    .addRule('require-module-attributes', ERROR) /** @since 61.0.0 */
    .addRule('require-module-specifiers', ERROR) /** @since 60.0.0 */
    .addRule('require-number-to-fixed-digits-argument', ERROR) /** @since 33.0.0 */
    .addRule('require-passive-events', ERROR) /** @since 65.0.0 */
    .addRule('require-post-message-target-origin', OFF) /** @since 34.0.0 */ // 🔴
    .addRule('string-content', OFF) /** @since 17.0.0 */ // 🔴
    .addRule('switch-case-braces', ERROR) /** @since 44.0.0 */ // 🟣
    .addRule('switch-case-break-position', ERROR) /** @since 64.0.0 */ // 🟣
    .addRule('template-indent', ERROR) /** @since 37.0.0 */ // 🟣🟠
    .addRule(
      'text-encoding-identifier-case',
      enforceTextEncodingCaseAndNotation ? ERROR : OFF,
      enforceTextEncodingCaseAndNotation
        ? [{withDash: enforceTextEncodingCaseAndNotation === 'dash'}]
        : [],
    ) /** @since 41.0.0 */
    .addRule('throw-new-error', ERROR) /** @since 0.1.0 */
    .addRule('try-complexity', OFF) /** @since 65.0.0 */ // 🔴
    .enableConfigTesterForPlugin('unicorn')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'unicorn'>;
