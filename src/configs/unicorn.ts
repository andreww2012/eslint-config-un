import {ERROR, OFF, WARNING} from '../constants';
import type {Prettify} from '../types';
import {partition} from '../utils';
import {
  type ArrayOrBooleanRecord,
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

type NumberPropertiesStyle = 'global' | 'namespace';

export interface UnicornEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unicorn'> {
  /**
   * Current and extended class references in class static methods can be either
   * accessed with `this` and `super` respectively, or using direct class references.
   *
   * This option enforce the accessing style:
   * - `thisAndSuper`: enforce `this` and `super`;
   * - `identifiers`: enforce identifies in both cases;
   * - `true`: use the default style;
   * - `false`: do not enforce any style;
   * - object: configure rule options directly (allows to configure different styles for
   * current and extended classes).
   *
   * Affected rule:
   * - [`unicorn/class-reference-in-static-methods`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/class-reference-in-static-methods.md)
   * @default 'thisAndSuper'
   */
  classReferenceInStaticMethodsStyle?:
    | boolean
    | 'thisAndSuper'
    | 'identifiers'
    | GetRuleOptions<'unicorn', 'class-reference-in-static-methods'>;

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
    boolean | Record<string, string | false> | ConsistentCompoundWordsOptions;

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
   * Enforce that boolean variables, parameters, functions, and optionally
   * object properties have one of the allowed prefixes.
   *
   * Possible options:
   * - `true`: use the default prefixes list;
   * - `false`: do not enforce prefixes;
   * - object form will be merged with the default value;
   * - array form completely overrides the default value.
   *
   * Affected rule:
   * - [`unicorn/consistent-boolean-name`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-boolean-name.md)
   * @default {is: true, are: true, was: true, were: true, has: true, had: true, can: true, should: true, must: true, may: true, does: true, do: true, did: true, will: true, needs: true, requires: true, allows: true, supports: true, contains: true, includes: true}
   */
  enforcePrefixForBooleanNames?: boolean | ArrayOrBooleanRecord;

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
   * Enforce or disallow explicit `setTimeout`/`setInterval` delay (the second parameter),
   * even if it would be redundant (`0`).
   *
   * Setting to `true` is equivalent of the default value.
   *
   * Set to `false` to not enforce.
   *
   * Affected rule:
   * - [`unicorn/explicit-timer-delay`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/explicit-timer-delay.md)
   * @default 'always'
   */
  explicitTimersDelay?: boolean | GetRuleOptions<'unicorn', 'explicit-timer-delay'>;

  /**
   * Only allow variables with callable or constructable values to have
   * the following prefixes.
   *
   * Possible options:
   * - `true`: use the default prefixes list;
   * - `false`: do not enforce prefixes;
   * - object form will be merged with the default value;
   * - array form completely overrides the default value.
   *
   * Affected rules:
   * - [`unicorn/no-non-function-verb-prefix`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-non-function-verb-prefix.md)
   * @default {get: true, set: true, unset: true, delete: true, add: true, remove: true, destroy: true, create: true}
   */
  functionPrefixesToDisallowForCallables?: boolean | ArrayOrBooleanRecord;

  /**
   * Limits the number of `nested(functions(calls()))`.
   *
   * Not enforced by default.
   *
   * Specifying values below 1 *disables* the affected rule.
   *
   * Affected rule:
   * - [`unicorn/max-nested-calls`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/max-nested-calls.md)
   * @default 0
   */
  maxNestedCalls?: number;

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
  minComparisonsToPreferArrayIncludes?: number;

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
  minWhitespaceRepetitionsToPreferStringRepeat?: number;

  /**
   * Several `Number` methods and constants may be used directly as globals
   * or from the `Number` object.
   *
   * This option enforces the single style of usage for all of them.
   * The following table contains all such pairs, what style is enforced
   * for any of them by default:
   * | Global | `Number` property | Behavior different? | Default style |
   * | - | - | - | - |
   * | `NaN` | `NaN` | 🟢 No | `namespace` |
   * | `Infinity` | `POSITIVE_INFINITY` | 🟢 No | `namespace` |
   * | `-Infinity` | `NEGATIVE_INFINITY` | 🟢 No | `namespace` |
   * | `parseInt` | `parseInt` | 🟢 No | `namespace` |
   * | `parseFloat` | `parseFloat` | 🟢 No | `namespace` |
   * | `isNaN` | `isNaN` | 🔴 Yes, the namespace version is stricter | `namespace` |
   * | `isFinite` | `isFinite` | 🔴 Yes, the namespace version is stricter | `namespace` |
   *
   * Any custom value except `boolean` override the defaults.
   * `true` is the same as not setting the option at all.
   * `false` stops any enforcements.
   *
   * ⚠️ Note there are limitation of how the affected rules can be configured:
   * - It is possible to enforce the `global` style only for `NaN` and both
   * of the infinities;
   * - It is not possible to enforce the namespace style for `NaN` and the infinities:
   *    - Without also enforcing the same style for methods (though the opposite
   * of the latter is unlikely what you want);
   *    - Giving up the ability to enforce the `global` style for other constants if you only enforced the `namespace` style for some.
   *
   * Affected rules:
   * - [`unicorn/prefer-global-number-constants`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-global-number-constants.md)
   * - [`unicorn/prefer-number-properties`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-number-properties.md)
   * @default 'namespace'
   */
  numberProperties?:
    | boolean
    | 'namespace'
    | {
        constants?:
          | NumberPropertiesStyle
          | Prettify<Partial<Record<'nan' | 'positiveAndNegativeInfinity', 'namespace'>>>;
        methods?: 'namespace';
      };
}

// ⚠️ DO NOT FORGET to sync this list with the corresponding option's jsdoc
const DEFAULT_ALLOWED_BOOLEAN_PREFIXES = {
  is: true,
  are: true,
  was: true,
  were: true,
  has: true,
  had: true,
  can: true,
  should: true,
  must: true,
  may: true,
  does: true,
  do: true,
  did: true,
  will: true,
  needs: true,
  requires: true,
  allows: true,
  supports: true,
  contains: true,
  includes: true,
} satisfies Partial<Record<string, boolean>>;

// ⚠️ Must be in sync with the plugin's rule source
const DEFAULT_PLUGIN_ALLOWED_BOOLEAN_PREFIXES = new Set([
  'is',
  'has',
  'can',
  'should',
  'was',
  'did',
  'will',
]);

// ⚠️ DO NOT FORGET to sync this list with the corresponding option's jsdoc
const DEFAULT_CALLABLE_OR_CONSTRUCTABLE_PREFIXES = {
  get: true,
  set: true,
  unset: true,
  delete: true,
  add: true,
  remove: true,
  destroy: true,
  create: true,
} satisfies Partial<Record<string, boolean>>;

const DEFAULT_NUMBER_PROPERTIES: UnicornEslintConfigOptions['numberProperties'] = 'namespace';

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    classReferenceInStaticMethodsStyle: 'thisAndSuper',
    compoundWordsSuggestedReplacements: true,
    domDataAttributesStyle: 'dataset',
    enforcePrefixForBooleanNames: true,
    enforceTextEncodingCaseAndNotation: 'no-dash',
    explicitTimersDelay: 'always',
    functionPrefixesToDisallowForCallables: true,
    numberProperties: true,
    maxNestedCalls: 0,
    minComparisonsToPreferArrayIncludes: 3,
    minWhitespaceRepetitionsToPreferStringRepeat: 3,
  });

  const {
    classReferenceInStaticMethodsStyle,
    compoundWordsSuggestedReplacements,
    domDataAttributesStyle,
    enforcePrefixForBooleanNames: enforcePrefixForBooleanNamesInitial,
    enforceTextEncodingCaseAndNotation,
    explicitTimersDelay,
    functionPrefixesToDisallowForCallables: functionPrefixesToDisallowForCallablesInitial,
    maxNestedCalls,
    minComparisonsToPreferArrayIncludes,
    minWhitespaceRepetitionsToPreferStringRepeat,
  } = optionsResolved;

  const numberProperties =
    optionsResolved.numberProperties === true
      ? DEFAULT_NUMBER_PROPERTIES
      : optionsResolved.numberProperties || null;

  const enforcePrefixForBooleanNames = enforcePrefixForBooleanNamesInitial
    ? Array.isArray(enforcePrefixForBooleanNamesInitial)
      ? Object.fromEntries([
          ...Array.from(
            DEFAULT_PLUGIN_ALLOWED_BOOLEAN_PREFIXES,
            (defaultPrefix) => [defaultPrefix, false] as const,
          ),
          ...enforcePrefixForBooleanNamesInitial.map((name) => [name, true] as const),
        ])
      : {
          ...DEFAULT_ALLOWED_BOOLEAN_PREFIXES,
          ...(enforcePrefixForBooleanNamesInitial !== true && enforcePrefixForBooleanNamesInitial),
        }
    : null;

  const functionPrefixesToDisallowForCallables = functionPrefixesToDisallowForCallablesInitial
    ? Array.isArray(functionPrefixesToDisallowForCallablesInitial)
      ? functionPrefixesToDisallowForCallablesInitial
      : Object.entries({
          ...DEFAULT_CALLABLE_OR_CONSTRUCTABLE_PREFIXES,
          ...(functionPrefixesToDisallowForCallablesInitial !== true &&
            functionPrefixesToDisallowForCallablesInitial),
        } satisfies Record<string, boolean> as Record<string, boolean>)
          .filter(([, active]) => active)
          .map(([prefix]) => prefix)
    : null;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unicorn');

  // Legend:
  // 💭? - optionally requires type information
  // 🔴 - NOT in recommended & unopinionated
  // 🟣 - NOT in unopinionated
  // 🟠 - rule from `eslint-config-prettier`
  // 🟡 - only making sense for plain JS (functionality ~fully covered by TS)

  configBuilder
    ?.addConfig([
      'unicorn',
      {
        includeDefaultFilesAndIgnores: true,
      },
    ])
    .addRule('better-dom-traversing', ERROR) /** @since 65.0.0 */
    .addRule('catch-error-name', WARNING) /** @since 0.4.0 */ // 🟣
    .addRule(
      'class-reference-in-static-methods',
      classReferenceInStaticMethodsStyle ? ERROR : OFF,
      classReferenceInStaticMethodsStyle
        ? [
            classReferenceInStaticMethodsStyle === 'thisAndSuper' ||
            classReferenceInStaticMethodsStyle === true
              ? {preferThis: true, preferSuper: true}
              : classReferenceInStaticMethodsStyle === 'identifiers'
                ? {preferThis: false, preferSuper: false}
                : classReferenceInStaticMethodsStyle,
          ]
        : [],
    ) /** @since 66.0.0 */ // 🟣
    .addRule('comment-content', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('consistent-assert', WARNING) /** @since 57.0.0 */ // 🟣
    .addRule(
      'consistent-boolean-name',
      enforcePrefixForBooleanNames ? ERROR : OFF,
      enforcePrefixForBooleanNames ? [{prefixes: enforcePrefixForBooleanNames}] : [],
    ) /** @since 67.0.0 */ // 🟣💭?
    .addRule('consistent-class-member-order', OFF) /** @since 66.0.0 */ // 🟣
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
    .addRule('consistent-conditional-object-spread', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('consistent-date-clone', ERROR) /** @since 57.0.0 */
    .addRule('consistent-destructuring', OFF) /** @since 26.0.0 */ // 🔴
    .addRule('consistent-empty-array-spread', ERROR) /** @since 53.0.0 */ // 🟣
    .addRule('consistent-existence-index-check', ERROR) /** @since 56.0.0 */
    .addRule('consistent-export-decorator-position', ERROR) /** @since 66.0.0 */ // 🟣
    // TODO
    .addRule('consistent-function-scoping', ERROR) /** @since 11.0.0 */ // 🟣
    .addRule('consistent-function-style', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('consistent-json-file-read', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('consistent-optional-chaining', ERROR) /** @since 66.0.0 */ // 🟡
    .addRule('consistent-template-literal-escape', ERROR) /** @since 64.0.0 */ // 🟣
    .addRule('consistent-tuple-labels', ERROR) /** @since 69.0.0 */ // 🟣
    .addRule('custom-error-definition', ERROR) /** @since 2.0.0 */ // 🔴
    .addRule('default-export-style', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule(
      'dom-node-dataset',
      domDataAttributesStyle ? ERROR : OFF,
      domDataAttributesStyle ? [{preferAttributes: domDataAttributesStyle === 'attributes'}] : [],
    ) /** @since 65.0.0 */ // 💭?
    .addRule('empty-brace-spaces', OFF) /** @since 24.0.0 */ // 🟣🟠
    .addRule('error-message', ERROR) /** @since 4.0.0 */
    .addRule('escape-case', ERROR) /** @since 2.0.0 */
    .addRule('expiring-todo-comments', ERROR) /** @since 11.0.0 */
    .addRule('explicit-length-check', ERROR) /** @since 1.0.0 */ // 🟣💭?
    .addRule(
      'explicit-timer-delay',
      explicitTimersDelay === false ? OFF : ERROR,
      explicitTimersDelay === false ? [] : [explicitTimersDelay === 'never' ? 'never' : 'always'],
    ) /** @since 66.0.0 */
    .addRule('filename-case', OFF) /** @since 0.3.0 */ // 🟣
    .addRule('id-match', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('import-style', ERROR) /** @since 22.0.0 */
    .addRule('isolated-functions', OFF) /** @since 63.0.0 */
    .addRule('logical-assignment-operators', OFF) /** @since 67.0.0 */ // 🟣
    .addRule(
      'max-nested-calls',
      maxNestedCalls > 0 ? ERROR : OFF,
      maxNestedCalls > 0 ? [{max: maxNestedCalls}] : [],
    ) /** @since 66.0.0 */ // 🟣
    // TODO consider enable and/or make configurable in future
    .addRule('name-replacements', OFF) /** @since 8.0.0 */ // 🟣
    .addRule('new-for-builtins', ERROR) /** @since 3.0.0 */
    .addRule('no-abusive-eslint-disable', ERROR) /** @since 0.5.0 */
    .addRule('no-accessor-recursion', ERROR) /** @since 57.0.0 */
    .addRule('no-accidental-bitwise-operator', ERROR) /** @since 68.0.0 */
    .addRule('no-anonymous-default-export', OFF) /** @since 52.0.0 */ // Note: there's the same rule in import plugin
    .addRule(
      'no-array-callback-reference',
      OFF,
    ) /** @since 3.0.0 */ /** @aka no-fn-reference-in-iterator */ // 🟣💭?
    .addRule('no-array-concat-in-loop', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('no-array-fill-with-reference-type', ERROR) /** @since 65.0.0 */
    .addRule('no-array-from-fill', ERROR) /** @since 65.0.0 */
    .addRule('no-array-front-mutation', OFF) /** @since 68.0.0 */ // 🔴💭?
    .addRule('no-array-method-this-argument', ERROR) /** @since 34.0.0 */ // 💭?
    .addRule('no-array-reduce', OFF) /** @since 20.0.0 */ /** @aka no-reduce */ // 🟣💭?
    .addRule('no-array-reverse', ERROR) /** @since 60.0.0 */
    .addRule('no-array-sort', ERROR) /** @since 61.0.0 */
    .addRule('no-array-sort-for-min-max', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-array-splice', ERROR) /** @since 67.0.0 */ // 🟣💭?
    .addRule('no-asterisk-prefix-in-documentation-comments', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('no-async-promise-finally', ERROR) /** @since 70.0.0 */ // 💭?
    .addRule('no-await-expression-member', OFF) /** @since 39.0.0 */ // 🟣
    .addRule('no-await-in-promise-methods', ERROR) /** @since 52.0.0 */
    .addRule('no-blob-to-file', ERROR) /** @since 65.0.0 */
    .addRule('no-boolean-sort-comparator', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-break-in-nested-loop', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-canvas-to-image', ERROR) /** @since 65.0.0 */
    .addRule('no-chained-comparison', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-collection-bracket-access', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-computed-property-existence-check', OFF) /** @since 66.0.0 */ // 🟣💭?
    .addRule('no-confusing-array-splice', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-confusing-array-with', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-console-spaces', ERROR) /** @since 7.0.0 */
    .addRule('no-constant-zero-expression', ERROR) /** @since 68.0.0 */
    .addRule('no-declarations-before-early-exit', ERROR) /** @since 66.0.0 */
    .addRule('no-document-cookie', ERROR) /** @since 32.0.0 */
    .addRule('no-double-comparison', ERROR) /** @since 68.0.0 */
    .addRule('no-duplicate-if-branches', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('no-duplicate-logical-operands', ERROR) /** @since 68.0.0 */
    .addRule('no-duplicate-loops', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-duplicate-set-values', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-empty-file', ERROR) /** @since 38.0.0 */
    .addRule('no-error-property-assignment', ERROR) /** @since 66.0.0 */
    .addRule('no-exports-in-scripts', ERROR) /** @since 65.0.0 */
    .addRule('no-for-each', OFF) /** @since 27.0.0 */ /** @aka no-array-for-each */ // 💭?
    .addRule('no-for-loop', OFF) /** @since 8.0.0 */ // 🟣💭?
    .addRule('no-global-object-property-assignment', OFF) /** @since 66.0.0 */ // 🟡
    .addRule('no-immediate-mutation', ERROR) /** @since 62.0.0 */
    .addRule('no-impossible-length-comparison', ERROR) /** @since 68.0.0 */
    .addRule('no-incorrect-query-selector', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-incorrect-template-string-interpolation', ERROR) /** @since 66.0.0 */
    .addRule('no-instanceof-builtins', ERROR) /** @since 57.0.0 */
    .addRule('no-invalid-argument-count', ERROR) /** @since 67.0.0 */
    .addRule('no-invalid-character-comparison', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-invalid-fetch-options', ERROR) /** @since 53.0.0 */
    // Note: also works on html
    .addRule('no-invalid-file-input-accept', ERROR) /** @since 65.0.0 */
    .addRule('no-invalid-remove-event-listener', ERROR) /** @since 36.0.0 */
    .addRule('no-invalid-well-known-symbol-methods', ERROR) /** @since 69.0.0 */ // 💭?
    .addRule('no-keyword-prefix', OFF) /** @since 10.0.0 */ // 🔴
    .addRule('no-late-current-target-access', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule('no-late-event-control', ERROR) /** @since 69.0.0 */ // 🟣💭?
    .addRule('no-lonely-if', ERROR) /** @since 24.0.0 */
    .addRule('no-loop-iterable-mutation', ERROR) /** @since 68.0.0 */ // 🟣💭?
    // Passing `Infinity` doesn't work great with TypeScript
    .addRule('no-magic-array-flat-depth', OFF) /** @since 53.0.0 */
    .addRule('no-manually-wrapped-comments', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('no-mismatched-map-key', ERROR) /** @since 66.0.0 */ // 🟣💭?
    .addRule(
      'no-misrefactored-assignment', // cspell:disable-line
      ERROR,
    ) /** @since 68.0.0 */
    .addRule('no-named-default', ERROR) /** @since 57.0.0 */
    .addRule('no-negated-array-predicate', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('no-negated-comparison', ERROR) /** @since 66.0.0 */
    // "This is an improved version of the no-negated-condition ESLint rule that makes it automatically fixable" - Unicorn docs
    .addRule('no-negated-condition', ERROR) /** @since 45.0.0 */
    .disableAnyRule('', 'no-negated-condition')
    .addRule('no-negation-in-equality-check', ERROR) /** @since 54.0.0 */
    .addRule('no-nested-ternary', OFF) /** @since 11.0.0 */ // 🟣🟠
    .addRule('no-new-array', ERROR) /** @since 26.0.0 */
    .addRule('no-new-buffer', ERROR) /** @since 2.0.0 */
    .addRule(
      'no-non-function-verb-prefix',
      functionPrefixesToDisallowForCallables?.length ? ERROR : OFF,
      functionPrefixesToDisallowForCallables?.length
        ? [{verbs: functionPrefixesToDisallowForCallables}]
        : [],
    ) /** @since 67.0.0 */ // 🟣💭?
    .addRule('no-nonstandard-builtin-properties', ERROR) /** @since 68.0.0 */ // 🟡
    .addRule('no-null', OFF) /** @since 19.0.0 */ // 🟣
    .addRule('no-object-as-default-parameter', ERROR) /** @since 21.0.0 */
    .addRule('no-object-methods-with-collections', ERROR) /** @since 66.0.0 */ // 🟣💭?
    .addRule('no-optional-chaining-on-undeclared-variable', ERROR) /** @since 66.0.0 */ // 🟣🟡
    .addRule('no-process-exit', OFF) /** @since 0.2.0 */ // Used in `node` config
    .addRule('no-redundant-comparison', ERROR) /** @since 66.0.0 */
    .addRule('no-return-array-push', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-selector-as-dom-name', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('no-single-promise-in-promise-methods', ERROR) /** @since 52.0.0 */
    .addRule('no-static-only-class', ERROR) /** @since 29.0.0 */
    .addRule('no-subtraction-comparison', ERROR) /** @since 66.0.0 */
    .addRule('no-thenable', ERROR) /** @since 40.0.0 */
    .addRule('no-this-assignment', ERROR) /** @since 27.0.0 */
    .addRule('no-this-outside-of-class', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('no-top-level-assignment-in-function', OFF) /** @since 67.0.0 */ // 🟣
    .addRule('no-top-level-side-effects', ERROR) /** @since 66.0.0 */
    .addRule('no-typeof-undefined', ERROR) /** @since 45.0.0 */
    .addRule('no-uncalled-method', ERROR) /** @since 67.0.0 */ // 🟣💭?
    .addRule('no-undeclared-class-members', ERROR) /** @since 65.0.0 */ // 🟣🟡
    .addRule('no-unnecessary-array-flat-depth', ERROR) /** @since 59.0.0 */
    .addRule('no-unnecessary-array-flat-map', ERROR) /** @since 70.0.0 */ // 🟣💭?
    .addRule('no-unnecessary-array-splice-count', ERROR) /** @since 59.0.0 */
    .addRule('no-unnecessary-await', ERROR) /** @since 44.0.0 */
    .addRule('no-unnecessary-boolean-comparison', ERROR) /** @since 68.0.0 */ // 🟣💭?
    .addRule('no-unnecessary-fetch-options', ERROR) /** @since 70.0.0 */ // 💭?
    .addRule('no-unnecessary-global-this', ERROR) /** @since 66.0.0 */
    .addRule('no-unnecessary-nested-ternary', ERROR) /** @since 65.0.0 */
    .addRule('no-unnecessary-polyfills', ERROR) /** @since 50.0.0 */
    .addRule(
      'no-unnecessary-slice-end',
      ERROR,
    ) /** @since 55.0.0 */ /** @aka no-length-as-slice-end */
    .addRule('no-unnecessary-splice', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-unreadable-array-destructuring', OFF) /** @since 7.0.0 */
    .addRule('no-unreadable-for-of-expression', OFF) /** @since 67.0.0 */ // 🟣
    .addRule('no-unreadable-iife', ERROR) /** @since 42.0.0 */
    .addRule('no-unreadable-new-expression', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('no-unreadable-object-destructuring', OFF) /** @since 42.0.0 */
    .addRule('no-unsafe-buffer-conversion', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('no-unsafe-dom-html', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('no-unsafe-promise-all-settled-values', ERROR) /** @since 70.0.0 */ // 💭?
    .addRule('no-unsafe-property-key', ERROR) /** @since 66.0.0 */ // 🟣🟡💭?
    .addRule('no-unsafe-string-replacement', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-unused-array-method-return', ERROR) /** @since 65.0.0 */
    .addRule('no-unused-properties', OFF) /** @since 7.0.0 */ // 🔴
    .addRule('no-useless-boolean-cast', ERROR) /** @since 66.0.0 */
    .addRule('no-useless-coercion', ERROR) /** @since 67.0.0 */ // 💭?
    .addRule('no-useless-collection-argument', ERROR) /** @since 62.0.0 */
    .addRule('no-useless-compound-assignment', ERROR) /** @since 68.0.0 */
    .addRule('no-useless-concat', ERROR) /** @since 66.0.0 */
    .addRule('no-useless-continue', ERROR) /** @since 67.0.0 */
    .addRule('no-useless-delete-check', ERROR) /** @since 68.0.0 */
    .addRule('no-useless-else', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-useless-error-capture-stack-trace', ERROR) /** @since 60.0.0 */
    .addRule('no-useless-fallback-in-spread', ERROR) /** @since 36.0.0 */
    .addRule('no-useless-iterator-to-array', ERROR) /** @since 64.0.0 */
    .addRule('no-useless-length-check', ERROR) /** @since 35.0.0 */ // 💭?
    .addRule('no-useless-logical-operand', ERROR) /** @since 68.0.0 */ // 💭?
    .addRule('no-useless-override', ERROR) /** @since 67.0.0 */ // 💭?
    .addRule('no-useless-promise-resolve-reject', ERROR) /** @since 40.0.0 */
    .addRule('no-useless-recursion', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('no-useless-spread', ERROR) /** @since 35.0.0 */ // 💭?
    .addRule('no-useless-switch-case', ERROR) /** @since 42.0.0 */
    .addRule('no-useless-template-literals', ERROR) /** @since 66.0.0 */
    .addRule('no-useless-undefined', ERROR, [
      {checkArguments: false, checkArrowFunctionBody: false},
    ]) /** @since 20.0.0 */
    .addRule('no-xor-as-exponentiation', ERROR) /** @since 68.0.0 */
    .addRule('no-zero-fractions', ERROR) /** @since 8.0.0 */
    .addRule('number-literal-case', OFF) /** @since 2.0.0 */ // 🟠
    .addRule('numeric-separators-style', ERROR, [
      {onlyIfContainsSeparator: true},
    ]) /** @since 23.0.0 */
    .addRule('operator-assignment', OFF) /** @since 67.0.0 */ // 🟣
    .addRule('prefer-abort-signal-any', ERROR) /** @since 70.0.0 */ // 🟣💭?
    .addRule('prefer-abort-signal-timeout', ERROR) /** @since 69.0.0 */ // 🟣
    .addRule('prefer-add-event-listener', ERROR) /** @since 4.0.0 */
    .addRule('prefer-add-event-listener-options', ERROR) /** @since 66.0.0 */
    .addRule('prefer-aggregate-error', ERROR) /** @since 69.0.0 */ // 💭?
    .addRule('prefer-array-find', ERROR) /** @since 21.0.0 */ // 💭?
    .addRule('prefer-array-flat', ERROR) /** @since 29.0.0 */
    .addRule('prefer-array-flat-map', ERROR) /** @since 9.0.0 */ /** @aka prefer-flat-map */ // 💭?
    .addRule('prefer-array-from-async', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('prefer-array-from-map', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-array-from-range', ERROR) /** @since 70.0.0 */
    .addRule('prefer-array-index-of', ERROR) /** @since 26.0.0 */
    .addRule('prefer-array-iterable-methods', ERROR) /** @since 68.0.0 */ // 🟣💭?
    .addRule('prefer-array-last-methods', ERROR) /** @since 65.0.0 */
    .addRule('prefer-array-slice', ERROR) /** @since 67.0.0 */ // 🟣💭?
    .addRule('prefer-array-some', ERROR) /** @since 25.0.0 */ // 💭?
    .addRule('prefer-at', ERROR) /** @since 34.0.0 */ // 💭?
    .addRule('prefer-await', OFF) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-bigint-literals', ERROR) /** @since 61.0.0 */
    .addRule('prefer-blob-reading-methods', ERROR) /** @since 47.0.0 */
    .addRule('prefer-block-statement-over-iife', ERROR) /** @since 70.0.0 */
    .addRule('prefer-boolean-return', ERROR) /** @since 68.0.0 */
    .addRule('prefer-class-fields', ERROR) /** @since 60.0.0 */
    .addRule('prefer-classlist-toggle', ERROR) /** @since 61.0.0 */
    .addRule('prefer-code-point', ERROR) /** @since 39.0.0 */
    .addRule('prefer-continue', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('prefer-date-now', ERROR) /** @since 24.0.0 */
    .addRule('prefer-default-parameters', ERROR) /** @since 25.0.0 */
    .addRule('prefer-direct-iteration', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-dispose', ERROR) /** @since 66.0.0 */ // 🔴💭?
    .addRule('prefer-dom-node-append', ERROR) /** @since 7.0.0 */ /** @aka prefer-node-append */
    .addRule('prefer-dom-node-html-methods', OFF) /** @since 66.0.0 */ // 🔴
    .addRule('prefer-dom-node-remove', ERROR) /** @since 8.0.0 */ /** @aka prefer-node-remove */
    .addRule('prefer-dom-node-replace-children', ERROR) /** @since 69.0.0 */ // 💭?
    .addRule(
      'prefer-dom-node-text-content',
      OFF,
    ) /** @since 8.0.0 */ /** @aka prefer-text-content */ // 💭?
    .addRule('prefer-early-return', ERROR) /** @since 66.0.0 */
    .addRule('prefer-else-if', OFF) /** @since 67.0.0 */ // 🟣💭?
    // TODO should consider enabling by default when `Iterator#toArray` becomes Baseline widely available: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError
    .addRule('prefer-error-is-error', OFF) /** @since 69.0.0 */ // 🔴
    .addRule('prefer-event-target', ERROR) /** @since 43.0.0 */
    .addRule('prefer-export-from', ERROR, [{}]) /** @since 38.0.0 */ // 🟣
    .addRule('prefer-flat-math-min-max', ERROR) /** @since 68.0.0 */
    .addRule('prefer-get-or-insert-computed', ERROR) /** @since 65.0.0 */ // 🟣
    .addRule(
      'prefer-global-number-constants',
      typeof numberProperties === 'object' && numberProperties?.constants === 'global'
        ? ERROR
        : OFF,
    ) /** @since 66.0.0 */
    .addRule('prefer-global-this', OFF) /** @since 56.0.0 */
    .addRule('prefer-group-by', OFF) /** @since 70.0.0 */ // 💭?
    .addRule('prefer-has-check', ERROR) /** @since 67.0.0 */ // 💭?
    .addRule('prefer-hoisting-branch-code', ERROR) /** @since 68.0.0 */ // 🟣
    .addRule('prefer-https', OFF) /** @since 65.0.0 */ // 🟣
    .addRule('prefer-identifier-import-export-specifiers', ERROR) /** @since 66.0.0 */
    .addRule('prefer-import-meta-properties', OFF) /** @since 59.0.0 */ // 🔴 used in `node` config
    .addRule('prefer-includes', ERROR) /** @since 8.0.0 */ // 💭?
    .addRule(
      'prefer-includes-over-repeated-comparisons',
      minComparisonsToPreferArrayIncludes > 1 ? ERROR : OFF,
      minComparisonsToPreferArrayIncludes > 1
        ? [{minimumComparisons: minComparisonsToPreferArrayIncludes}]
        : [],
    ) /** @since 65.0.0 */
    .addRule('prefer-iterable-in-constructor', ERROR) /** @since 66.0.0 */
    // Reason for disabling: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2565
    .addRule('prefer-iterator-concat', OFF) /** @since 65.0.0 */ // 🔴
    .addRule('prefer-iterator-helpers', ERROR) /** @since 70.0.0 */ // 💭?
    // TODO should consider enabling by default when `Iterator#toArray` becomes Baseline widely available: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/toArray
    .addRule('prefer-iterator-to-array', OFF) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-iterator-to-array-at-end', ERROR) /** @since 65.0.0 */
    .addRule('prefer-keyboard-event-key', ERROR) /** @since 9.0.0 */ /** @aka prefer-event-key */ // 💭?
    .addRule('prefer-location-assign', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-logical-operator-over-ternary', ERROR) /** @since 43.0.0 */
    .addRule('prefer-map-from-entries', ERROR) /** @since 67.0.0 */
    .addRule('prefer-math-abs', ERROR) /** @since 65.0.0 */
    .addRule('prefer-math-constants', ERROR) /** @since 68.0.0 */
    .addRule('prefer-math-min-max', ERROR) /** @since 56.0.0 */
    .addRule('prefer-math-trunc', ERROR) /** @since 23.0.0 */
    .addRule('prefer-minimal-ternary', ERROR) /** @since 66.0.0 */
    .addRule('prefer-modern-dom-apis', ERROR) /** @since 15.0.0 */ // 💭?
    .addRule('prefer-modern-math-apis', ERROR) /** @since 42.0.0 */
    .addRule('prefer-module', OFF) /** @since 31.0.0 */
    .addRule('prefer-native-coercion-functions', ERROR) /** @since 42.0.0 */
    .addRule('prefer-negative-index', ERROR) /** @since 14.0.0 */
    .addRule('prefer-node-protocol', OFF) /** @since 31.0.0 */ // `n/prefer-node-protocol` seem to be better as it checks supported node versions
    .addRule('prefer-number-coercion', OFF) /** @since 66.0.0 */
    .addRule('prefer-number-is-safe-integer', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule(
      'prefer-number-properties',
      numberProperties === 'namespace' ||
        numberProperties?.methods === 'namespace' ||
        numberProperties?.constants === 'namespace' ||
        (typeof numberProperties?.constants === 'object' &&
          Object.values(numberProperties.constants).some(
            (v) =>
              // eslint-disable-next-line ts/no-unnecessary-condition
              v === 'namespace',
          ))
        ? ERROR
        : OFF,
      numberProperties
        ? [
            {
              ...((numberProperties === 'namespace' ||
                numberProperties.constants === 'namespace' ||
                (typeof numberProperties.constants === 'object' &&
                  numberProperties.constants.positiveAndNegativeInfinity === 'namespace')) && {
                checkInfinity: true,
              }),
              ...((numberProperties === 'namespace' ||
                numberProperties.constants === 'namespace' ||
                (typeof numberProperties.constants === 'object' &&
                  numberProperties.constants.nan === 'namespace')) && {
                checkNaN: true,
              }),
            },
          ]
        : [],
    ) /** @since 18.0.0 */
    .addRule('prefer-object-define-properties', ERROR) /** @since 66.0.0 */
    .addRule('prefer-object-destructuring-defaults', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-object-from-entries', ERROR) /** @since 35.0.0 */
    .addRule('prefer-object-iterable-methods', ERROR) /** @since 66.0.0 */
    .addRule('prefer-observer-apis', ERROR) /** @since 69.0.0 */ // 🟣💭?
    .addRule('prefer-optional-catch-binding', ERROR) /** @since 20.0.0 */
    .addRule('prefer-path2d', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-private-class-fields', ERROR) /** @since 66.0.0 */ // 🟣
    // TODO enable when becomes baseline widely available or close to that: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try
    .addRule('prefer-promise-try', OFF) /** @since 69.0.0 */ // 🟣
    .addRule('prefer-promise-with-resolvers', ERROR) /** @since 68.0.0 */
    .addRule('prefer-prototype-methods', ERROR) /** @since 33.0.0 */
    .addRule('prefer-query-selector', OFF) /** @since 7.0.0 */ // 🟣
    .addRule('prefer-queue-microtask', ERROR) /** @since 65.0.0 */
    .addRule('prefer-reflect-apply', ERROR) /** @since 11.0.0 */
    // TODO enable when becomes baseline widely available or close to that: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
    .addRule('prefer-regexp-escape', OFF) /** @since 68.0.0 */ // 🔴💭?
    // TODO disable when regexp is enabled?
    .addRule('prefer-regexp-test', ERROR) /** @since 26.0.0 */ // 💭?
    .addRule('prefer-response-static-json', ERROR) /** @since 62.0.0 */
    .addRule('prefer-scoped-selector', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-set-has', ERROR) /** @since 18.0.0 */
    .addRule('prefer-set-methods', ERROR) /** @since 69.0.0 */ // 🟣💭?
    .addRule('prefer-set-size', ERROR) /** @since 45.0.0 */ // 💭?
    .addRule('prefer-short-arrow-method', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-simple-condition-first', ERROR) /** @since 64.0.0 */
    .addRule('prefer-simple-sort-comparator', ERROR) /** @since 64.0.0 */
    .addRule('prefer-simplified-conditions', ERROR) /** @since 70.0.0 */ // 💭?
    .addRule('prefer-single-array-predicate', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-single-call', ERROR) /** @since 27.0.0 */ /** @aka no-array-push-push */
    .addRule('prefer-single-object-destructuring', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-single-replace', ERROR) /** @since 68.0.0 */
    .addRule('prefer-smaller-scope', ERROR) /** @since 66.0.0 */ // 🟣
    .addRule('prefer-split-limit', ERROR) /** @since 65.0.0 */
    .addRule('prefer-spread', ERROR) /** @since 4.0.0 */ // 🟣💭?
    .addRule('prefer-string-match-all', ERROR) /** @since 65.0.0 */
    .addRule('prefer-string-pad-start-end', ERROR) /** @since 65.0.0 */
    .addRule('prefer-string-raw', ERROR) /** @since 53.0.0 */
    .addRule(
      'prefer-string-repeat',
      minWhitespaceRepetitionsToPreferStringRepeat > 1 ? ERROR : OFF,
      minWhitespaceRepetitionsToPreferStringRepeat > 1
        ? [{minimumRepetitions: minWhitespaceRepetitionsToPreferStringRepeat}]
        : [],
    ) /** @since 65.0.0 */
    .addRule('prefer-string-replace-all', ERROR) /** @since 16.0.0 */ /** @aka prefer-replace-all */ // 💭?
    .addRule('prefer-string-slice', ERROR) /** @since 12.0.0 */ // 💭?
    .addRule(
      'prefer-string-starts-ends-with',
      ERROR,
    ) /** @since 2.0.0 */ /** @aka prefer-starts-ends-with */ // 💭?
    .addRule(
      'prefer-string-trim-start-end',
      ERROR,
    ) /** @since 14.0.0 */ /** @aka prefer-trim-start-end */ // 💭?
    .addRule('prefer-structured-clone', ERROR) /** @since 53.0.0 */
    .addRule('prefer-switch', ERROR, [
      {minimumCases: 4, emptyDefaultCase: 'do-nothing-comment'},
    ]) /** @since 30.0.0 */
    .addRule('prefer-temporal', OFF) /** @since 66.0.0 */ // 🔴💭?
    .addRule('prefer-ternary', ERROR) /** @since 23.0.0 */
    .addRule('prefer-toggle-attribute', OFF) /** @since 69.0.0 */ // 💭?
    .addRule('prefer-top-level-await', OFF) /** @since 34.0.0 */
    .addRule('prefer-type-error', ERROR) /** @since 2.0.0 */
    .addRule('prefer-type-literal-last', OFF) /** @since 66.0.0 */
    .addRule('prefer-uint8array-base64', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-unary-minus', ERROR) /** @since 68.0.0 */
    .addRule('prefer-unicode-code-point-escapes', ERROR) /** @since 66.0.0 */
    .addRule('prefer-url-can-parse', ERROR) /** @since 68.0.0 */
    .addRule('prefer-url-href', ERROR) /** @since 66.0.0 */ // 💭?
    .addRule('prefer-url-search-parameters', ERROR) /** @since 69.0.0 */ // 💭?
    .addRule('prefer-while-loop-condition', ERROR) /** @since 68.0.0 */
    .addRule('relative-url-style', ERROR, ['always']) /** @since 40.0.0 */
    .addRule('require-array-join-separator', ERROR) /** @since 33.0.0 */ // 💭?
    .addRule('require-array-sort-compare', OFF) /** @since 66.0.0 */ // 💭?
    .addRule('require-css-escape', ERROR) /** @since 65.0.0 */
    .addRule('require-module-attributes', ERROR) /** @since 61.0.0 */
    .addRule('require-module-specifiers', ERROR) /** @since 60.0.0 */
    .addRule('require-number-to-fixed-digits-argument', ERROR) /** @since 33.0.0 */
    .addRule('require-passive-events', ERROR) /** @since 65.0.0 */
    .addRule('require-post-message-target-origin', OFF) /** @since 34.0.0 */ // 🔴
    .addRule('require-proxy-trap-boolean-return', ERROR) /** @since 66.0.0 */
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
