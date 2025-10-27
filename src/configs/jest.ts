import type {Jest as JestMethods} from '@jest/environment';
import type {AsymmetricMatchers, JestExpect} from '@jest/expect';
import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type FlatConfigEntryForBuilder,
  type GetRuleOptions,
  type RuleNamesForPlugin,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {ObjectValues, PrettifyShallow} from '../types';
import {assignDefaults, doesPackageExist} from '../utils';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  RULES_TO_DISABLE_IN_TEST_FILES,
  generateConfigNoOnlyTestsBuilder,
  generateConsistentTestItOptions,
  generateDefaultTestFiles,
} from './shared';
import type {UnConfigFn} from './index';

type AllJestMatchers = PrettifyShallow<keyof ReturnType<JestExpect> | keyof AsymmetricMatchers>;

export interface JestEslintConfigOptions
  extends UnConfigOptions<'jest'>,
    NoOnlyTestsSubConfigDisabledByDefault {
  /**
   * [`eslint-plugin-jest` plugin settings](https://github.com/jest-community/eslint-plugin-jest?tab=readme-ov-file#aliased-jest-globals) that will be applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Tell the plugin about any global methods you have aliased.
     * @see https://github.com/jest-community/eslint-plugin-jest?tab=readme-ov-file#aliased-jest-globals
     * @example {describe: ['context']}
     */
    globalAliases?: Record<string, string[]>;

    /**
     * Tell the plugin to treat a different package as the source of Jest globals.
     * @see https://github.com/jest-community/eslint-plugin-jest?tab=readme-ov-file#aliased-jestglobals
     * @example 'bun:test'
     */
    globalPackage?: string;

    /**
     * @see https://github.com/jest-community/eslint-plugin-jest?tab=readme-ov-file#jest-version-setting
     */
    version?: number;
  };

  /**
   * Enables or specifies the configuration for the [`eslint-plugin-jest-extended`](https://npmjs.com/eslint-plugin-jest-extended) plugin.
   * @default true <=> `jest-extended` package is installed
   */
  configJestExtended?:
    | boolean
    | UnConfigOptions<
        'jest-extended',
        {
          /**
           * Suggests using various `jest-extended` methods instead of some assertion forms.
           *
           * ⚠️ If specified as object, unspecified options will be treated as if they were enabled (set to `true`).
           * @default true
           * @see https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-array.md - `toBeArray`
           * @see https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-false.md - `toBeFalse`
           * @see https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-object.md - `toBeObject`
           * @see https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-true.md - `toBeTrue`
           * @see https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-have-been-called-once.md - `toHaveBeenCalledOnce`
           */
          suggestUsing?:
            | boolean
            | Partial<
                Record<
                  'toBeArray' | 'toBeFalse' | 'toBeObject' | 'toBeTrue' | 'toHaveBeenCalledOnce',
                  boolean
                >
              >;
        }
      >;

  /**
   * Explicitly specify or ignore files written in TypeScript. Will be used to enable TypeScript-specific rules like [`no-untyped-mock-factory`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-untyped-mock-factory.md) or [`unbound-method`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md).
   * @default true <=> `ts` config is enabled
   */
  configTypescript?:
    | boolean
    | UnConfigOptions<
        Pick<RulesRecordPartial<'jest'>, `jest/${(typeof JEST_TYPESCRIPT_RELATED_RULES)[number]}`>
      >;

  /**
   * Will be merged with the default value. `false` disables the rule.
   *
   * When string, will be set for the properties of the object.
   * @default {fn: 'it', withinDescribe: 'it'}
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/consistent-test-it.md
   */
  testDefinitionKeyword?:
    | GetRuleOptions<'jest', 'consistent-test-it'>[0]
    | ObjectValues<GetRuleOptions<'jest', 'consistent-test-it'>[0] & {}>
    | false;

  /**
   * @default not enforced
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/max-expects.md
   */
  maxAssertionCalls?: number;

  /**
   * @default not enforced
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/max-nested-describe.md
   */
  maxNestedDescribes?: number;

  /**
   * Restricts the use of specific Jest methods.
   * "Restrictions are expressed in the form of a map, with the value being either a string message to be shown, or `null` if a generic default message should be used." - from eslint-plugin-jest docs
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-restricted-jest-methods.md
   */
  restrictedMethods?: Partial<Record<keyof JestMethods | (string & {}), string | null>>;

  /**
   * Restricts the use of specific Jest matchers.
   * "Bans are expressed in the form of a map, with the value being either a string message to be shown, or `null` if the default rule message should be used." - from eslint-plugin-jest docs
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-restricted-matchers.md
   */
  restrictedMatchers?: Partial<Record<AllJestMatchers | (string & {}), string | null>>;

  /**
   * Enforces padding around Jest functions.
   *
   * ⚠️ If specified as object, unspecified options will be treated as if they were enabled (set to `true`).
   * @default true
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-after-all-blocks.md - `afterAll`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-after-each-blocks.md - `afterEach`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-before-all-blocks.md - `beforeAll`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-before-each-blocks.md - `beforeEach`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-describe-blocks.md - `describe`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-expect-groups.md - `expect`
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-test-blocks.md - `test`
   */
  paddingAround?:
    | boolean
    | Partial<
        Record<
          'afterAll' | 'afterEach' | 'beforeAll' | 'beforeEach' | 'describe' | 'expect' | 'test',
          boolean
        >
      >;

  /**
   * Allows specifying which matchers return promises, and so should be considered async when checking if an `expect` should be returned or awaited.
   *
   * By default, this has a list of all the async matchers provided by jest-extended (namely, toResolve and toReject).
   *
   * *(from Jest docs)*
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect.md#asyncmatchers
   */
  asyncMatchers?: string[];

  /**
   * Enforces the minimum and maximum number of arguments that `expect` can take, and is required to take.
   *
   * This is useful when you're using libraries that increase the number of arguments supported by expect, such as [jest-expect-message](https://npmjs.com/jest-expect-message).
   *
   * *(from Jest docs)*
   *
   * Values less than 0 will be ignored.
   * @default [1, 1]
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect.md#minargs--maxargs
   */
  minAndMaxExpectArgs?: [min: number | undefined, max: number | undefined];
}

const JEST_TYPESCRIPT_RELATED_RULES = [
  'no-untyped-mock-factory',
  'unbound-method',
] satisfies RuleNamesForPlugin<'jest'>[];

const JEST_TYPESCRIPT_RELATED_RULES_SET = new Set<string>(JEST_TYPESCRIPT_RELATED_RULES);

export const jestUnConfig: UnConfigFn<'jest'> = async (context) => {
  const [eslintPluginJest, isJestExtendedInstalled] = await Promise.all([
    pluginsLoaders.jest(context).then(({module}) => module),
    doesPackageExist('jest-extended'),
  ]);

  context.usedPlugins.add('jest');
  if (!eslintPluginJest) {
    return null;
  }

  const isTsConfigEnabled = context.configsMeta.ts.enabled;

  const optionsRaw = context.rootOptions.configs?.jest;
  const optionsResolved = assignDefaults(optionsRaw, {
    configJestExtended: isJestExtendedInstalled,
    configNoOnlyTests: false,
    configTypescript: isTsConfigEnabled,
    paddingAround: true,
  } satisfies JestEslintConfigOptions);

  const {
    settings: pluginSettings,
    configJestExtended,
    configNoOnlyTests,
    configTypescript,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    paddingAround,
    asyncMatchers,
    minAndMaxExpectArgs,
  } = optionsResolved;

  const defaultJestEslintConfig: FlatConfigEntryForBuilder = {
    ...(pluginSettings && {
      settings: {
        jest: pluginSettings,
      },
    }),
    languageOptions: {
      // Yes, `globals.globals` is required
      globals: eslintPluginJest.environments.globals.globals,
    },
  };

  const defaultJestFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);
  const defaultJestTypescriptFiles = generateDefaultTestFiles(GLOB_TS_X_EXTENSION);

  const hasRestrictedMethods = Object.keys(restrictedMethods || {}).length > 0;
  const hasRestrictedMatchers = Object.keys(restrictedMatchers || {}).length > 0;

  const getPaddingAroundSeverity = (key: keyof (typeof paddingAround & object)) =>
    paddingAround === true || (paddingAround && paddingAround[key] !== false) ? ERROR : OFF;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'jest');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🎨 - in style

  configBuilder
    ?.addConfig(
      [
        'jest',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: defaultJestFiles,
        },
      ],
      defaultJestEslintConfig,
    )
    .addRule(
      'consistent-test-it',
      optionsResolved.testDefinitionKeyword === false ? OFF : ERROR,
      generateConsistentTestItOptions(optionsResolved),
    ) /** @since 21.9.0 */
    .addRule('expect-expect', ERROR) /** @since 21.20.1 */ // 🟡
    .addRule('max-expects', maxAssertionCalls == null ? OFF : ERROR, [
      {max: maxAssertionCalls},
    ]) /** @since 26.6.0 */
    .addRule('max-nested-describe', maxNestedDescribes == null ? OFF : ERROR, [
      {max: maxNestedDescribes},
    ]) /** @since 24.4.0 */
    .addRule('no-alias-methods', ERROR) /** @since 21.24.0 */ // 🟢 🎨
    .addRule('no-commented-out-tests', WARNING) /** @since 22.6.0 */ // 🟡
    .addRule('no-conditional-expect', ERROR) /** @since 23.16.0 */ // 🟢
    .addRule('no-conditional-in-test', OFF) /** @since 26.1.0-next.1 */
    .addRule('no-confusing-set-timeout', ERROR) /** @since 27.3.0 */
    .addRule('no-deprecated-functions', ERROR) /** @since 23.9.0 */ // 🟢
    .addRule('no-disabled-tests', WARNING) /** @since 18.5.0-alpha.7da3df39 */ // 🟡
    .addRule('no-done-callback', ERROR) /** @since 24.0.0 */ // 🟢
    .addRule('no-duplicate-hooks', ERROR) /** @since 22.8.0 */
    .addRule('no-export', ERROR) /** @since 22.11.0 */ // 🟢
    .addRule('no-focused-tests', ERROR) /** @since 18.5.0-alpha.7da3df39 */ // 🟢
    .addRule('no-hooks', OFF) /** @since 21.10.0 */
    .addRule('no-identical-title', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('no-interpolation-in-snapshots', ERROR) /** @since 23.19.0 */ // 🟢
    .addRule('no-jasmine-globals', ERROR) /** @since 21.16.0 */ // 🟢
    .addRule('no-large-snapshots', OFF) /** @since 21.4.0 */
    .addRule('no-mocks-import', ERROR) /** @since 22.5.0 */ // 🟢
    .addRule('no-restricted-jest-methods', hasRestrictedMethods ? ERROR : OFF, [
      restrictedMethods || {},
    ]) /** @since 27.1.0 */
    .addRule('no-restricted-matchers', hasRestrictedMatchers ? ERROR : OFF, [
      restrictedMatchers || {},
    ]) /** @since 23.11.0 */
    .addRule('no-standalone-expect', ERROR) /** @since 22.14.0 */ // 🟢
    .addRule('no-test-prefixes', ERROR) /** @since 21.11.0 */ // 🟢
    .addRule('no-test-return-statement', ERROR) /** @since 21.20.0 */
    .addRule(
      'padding-around-after-all-blocks',
      getPaddingAroundSeverity('afterAll'),
    ) /** @since 28.8.0 */
    .addRule(
      'padding-around-after-each-blocks',
      getPaddingAroundSeverity('afterEach'),
    ) /** @since 28.8.0 */
    .addRule('padding-around-all', OFF) /** @since 28.8.0 */
    .addRule(
      'padding-around-before-all-blocks',
      getPaddingAroundSeverity('beforeAll'),
    ) /** @since 28.8.0 */
    .addRule(
      'padding-around-before-each-blocks',
      getPaddingAroundSeverity('beforeEach'),
    ) /** @since 28.8.0 */
    .addRule(
      'padding-around-describe-blocks',
      getPaddingAroundSeverity('describe'),
    ) /** @since 28.8.0 */
    .addRule(
      'padding-around-expect-groups',
      getPaddingAroundSeverity('expect'),
    ) /** @since 28.8.0 */
    .addRule('padding-around-test-blocks', getPaddingAroundSeverity('test')) /** @since 28.8.0 */
    .addRule('prefer-called-with', OFF) /** @since 22.3.0 */
    .addRule('prefer-comparison-matcher', ERROR) /** @since 25.6.0 */
    .addRule('prefer-each', WARNING) /** @since 26.9.0 */
    .addRule('prefer-ending-with-an-expect', WARNING) /** @since 28.13.0 */
    .addRule('prefer-equality-matcher', ERROR) /** @since 25.7.0 */
    .addRule('prefer-expect-assertions', OFF) /** @since 21.6.0 */
    .addRule('prefer-expect-resolves', ERROR) /** @since 24.5.0 */
    .addRule('prefer-hooks-in-order', ERROR) /** @since 26.3.0 */
    .addRule('prefer-hooks-on-top', ERROR) /** @since 22.18.0 */
    .addRule('prefer-importing-jest-globals', OFF) /** @since 28.1.0 */
    .addRule('prefer-jest-mocked', ERROR) /** @since 28.6.0 */
    .addRule('prefer-lowercase-title', ERROR) /** @since 25.0.0-next.7 */
    .addRule('prefer-mock-promise-shorthand', ERROR) /** @since 26.7.0 */
    .addRule('prefer-snapshot-hint', OFF) /** @since 26.1.0 */
    .addRule('prefer-spy-on', ERROR) /** @since 21.27.0 */
    .addRule('prefer-strict-equal', WARNING) /** @since 21.21.0 */
    .addRule('prefer-to-be', ERROR) /** @since 24.5.0 */ // 🎨
    .addRule('prefer-to-contain', ERROR) /** @since 21.25.0 */ // 🎨
    .addRule('prefer-to-have-length', ERROR) /** @since 21.3.0-beta.5 */ // 🎨
    .addRule('prefer-todo', WARNING) /** @since 22.2.0 */
    .addRule('require-hook', WARNING) /** @since 24.7.0 */
    .addRule('require-to-throw-message', OFF) /** @since 23.0.0 */
    .addRule('require-top-level-describe', OFF) /** @since 22.16.0 */
    .addRule('valid-describe-callback', ERROR) /** @since 25.0.0-next.7 */
    .addRule('valid-expect', ERROR, [
      {
        alwaysAwait: true, // Default: false
        ...(asyncMatchers?.length && {asyncMatchers}),
        ...(minAndMaxExpectArgs?.[0] != null &&
          minAndMaxExpectArgs[0] >= 0 && {
            minArgs: minAndMaxExpectArgs[0],
          }),
        ...(minAndMaxExpectArgs?.[1] != null &&
          minAndMaxExpectArgs[1] >= 0 && {
            maxArgs: minAndMaxExpectArgs[1],
          }),
      },
    ]) /** @since 19.1.0-alpha.eed8203 */
    .addRule('valid-expect-in-promise', ERROR) /** @since 21.7.0 */ // 🟢
    .addRule('valid-title', ERROR) /** @since 22.20.0 */ // 🟢
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('jest', {
      rulesToSkipInConfig: (ruleName) => JEST_TYPESCRIPT_RELATED_RULES_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'jest',
    configNoOnlyTests,
    optionsResolved,
    {filesFallback: defaultJestFiles},
  );

  const configBuilderTypescript = createConfigBuilder(context, configTypescript, 'jest');
  configBuilderTypescript
    ?.addConfig(
      [
        'jest/ts',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: defaultJestTypescriptFiles,
        },
      ],
      {
        ...defaultJestEslintConfig,
      },
    )
    // Works only on TS files
    .addRule('no-untyped-mock-factory', ERROR) /** @since 27.2.0 */
    // Requires type checking
    // TODO auto-include test files in TS config?
    .addRule('unbound-method', isTsConfigEnabled ? ERROR : OFF) /** @since 24.3.0 */
    // https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md#how-to-use
    .disableAnyRule('ts', 'unbound-method')
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('jest', {
      rulesToSkipInConfig: (ruleName) => !JEST_TYPESCRIPT_RELATED_RULES_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderJestExtended = createConfigBuilder(
    context,
    configJestExtended,
    'jest-extended',
  );
  const {suggestUsing} = typeof configJestExtended === 'object' ? configJestExtended : {};

  const getSuggestUsingJestExtendedMatcherSeverity = (key: keyof (typeof suggestUsing & object)) =>
    suggestUsing === true || (suggestUsing && suggestUsing[key] !== false) ? ERROR : OFF;

  configBuilderJestExtended
    ?.addConfig(
      [
        'jest/extended',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: defaultJestFiles,
        },
      ],
      defaultJestEslintConfig,
    )
    .addRule(
      'prefer-to-be-array',
      getSuggestUsingJestExtendedMatcherSeverity('toBeArray'),
    ) /** @since 1.0.0 */
    .addRule(
      'prefer-to-be-false',
      getSuggestUsingJestExtendedMatcherSeverity('toBeFalse'),
    ) /** @since 0.0.1 */
    .addRule(
      'prefer-to-be-object',
      getSuggestUsingJestExtendedMatcherSeverity('toBeObject'),
    ) /** @since 1.0.0 */
    .addRule(
      'prefer-to-be-true',
      getSuggestUsingJestExtendedMatcherSeverity('toBeTrue'),
    ) /** @since 0.0.1 */
    .addRule(
      'prefer-to-have-been-called-once',
      getSuggestUsingJestExtendedMatcherSeverity('toHaveBeenCalledOnce'),
    ) /** @since 1.1.0 */
    .disableBulkRules(RULES_TO_DISABLE_IN_TEST_FILES)
    .enableConfigTesterForPlugin('jest-extended')
    .addOverrides();

  // TODO https://npmjs.com/eslint-plugin-jest-dom ?
  // Other plugins: eslint-plugin-jest-async, eslint-plugin-jest-formatting, eslint-plugin-jest-mock-config, eslint-plugin-jest-playwright, eslint-plugin-jest-react, eslint-plugin-jest-test-each-formatting

  return {
    configs: [
      configBuilder,
      configBuilderNoOnlyTests,
      configBuilderTypescript,
      configBuilderJestExtended,
    ],
    optionsResolved,
  };
};
