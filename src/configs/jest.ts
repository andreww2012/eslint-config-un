import type {Jest as JestMethods} from '@jest/environment';
import type {AsymmetricMatchers, JestExpect} from '@jest/expect';
import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  type FlatConfigEntryForBuilder,
  type GetRuleOptions,
  type RulesRecordPartial,
  type UnConfigOptions,
  createConfigBuilder,
} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {PrettifyShallow, ValueOf} from '../types';
import {assignDefaults, doesPackageExist} from '../utils';
import type {UnConfigFn} from './index';

type AllJestMatchers = PrettifyShallow<keyof ReturnType<JestExpect> | keyof AsymmetricMatchers>;

export const generateDefaultTestFiles = <T extends string>(extensions: T) => [
  `**/*.spec.${extensions}` as const, // GitHub: 2.3M .ts files as of 2024-12-08 (https://github.com/search?q=path%3A**%2F*.spec.ts&type=code&query=path%3A%2F**%2F__tests__%2F**%2F*.ts)
  `**/-spec.${extensions}` as const, // 165k
  `**/_spec.${extensions}` as const, // 40k

  `**/*.test.${extensions}` as const, // 1.9M

  `**/__tests__/**/*.${extensions}` as const, // 155k
  `**/__test__/**/*.${extensions}` as const, // 14k
];

export interface JestEslintConfigOptions extends UnConfigOptions<'jest'> {
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
        Pick<RulesRecordPartial<'jest'>, `jest/${'no-untyped-mock-factory' | 'unbound-method'}`>
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
    | ValueOf<GetRuleOptions<'jest', 'consistent-test-it'>[0] & {}>
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
   * This is useful when you're using libraries that increase the number of arguments supported by expect, such as [jest-expect-message](https://www.npmjs.com/package/jest-expect-message).
   *
   * *(from Jest docs)*
   *
   * Values less than 0 will be ignored.
   * @default [1, 1]
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect.md#minargs--maxargs
   */
  minAndMaxExpectArgs?: [min: number | undefined, max: number | undefined];
}

export const generateConsistentTestItOptions = ({
  testDefinitionKeyword,
}: Pick<JestEslintConfigOptions, 'testDefinitionKeyword'>): GetRuleOptions<
  'jest',
  'consistent-test-it'
> => [
  typeof testDefinitionKeyword === 'string'
    ? {
        fn: testDefinitionKeyword,
        withinDescribe: testDefinitionKeyword,
      }
    : {
        fn: 'it',
        withinDescribe: 'it',
        ...testDefinitionKeyword,
      },
];

export const jestUnConfig: UnConfigFn<'jest'> = async (context) => {
  const [eslintPluginJest, isJestExtendedInstalled] = await Promise.all([
    pluginsLoaders.jest(),
    doesPackageExist('jest-extended'),
  ]);

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  const optionsRaw = context.rootOptions.configs?.jest;
  const optionsResolved = assignDefaults(optionsRaw, {
    paddingAround: true,
    configTypescript: isTypescriptEnabled,
    configJestExtended: isJestExtendedInstalled,
  } satisfies JestEslintConfigOptions);

  const {
    settings: pluginSettings,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    paddingAround,
    asyncMatchers,
    minAndMaxExpectArgs,
    configTypescript,
    configJestExtended,
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
    )
    .addRule('expect-expect', ERROR) // 🟡
    .addRule('max-expects', maxAssertionCalls == null ? OFF : ERROR, [{max: maxAssertionCalls}])
    .addRule('max-nested-describe', maxNestedDescribes == null ? OFF : ERROR, [
      {max: maxNestedDescribes},
    ])
    .addRule('no-alias-methods', ERROR) // 🟢 🎨
    .addRule('no-commented-out-tests', WARNING) // 🟡🎨(warns)
    .addRule('no-conditional-expect', ERROR) // 🟢
    .addRule('no-conditional-in-test', OFF)
    .addRule('no-confusing-set-timeout', ERROR)
    .addRule('no-deprecated-functions', ERROR) // 🟢
    .addRule('no-disabled-tests', WARNING) // 🟡
    .addRule('no-done-callback', ERROR) // 🟢
    .addRule('no-duplicate-hooks', ERROR)
    .addRule('no-export', ERROR) // 🟢
    .addRule('no-focused-tests', ERROR) // 🟢
    .addRule('no-hooks', OFF)
    .addRule('no-identical-title', ERROR) // 🟢
    .addRule('no-interpolation-in-snapshots', ERROR) // 🟢
    .addRule('no-jasmine-globals', ERROR) // 🟢
    .addRule('no-large-snapshots', OFF)
    .addRule('no-mocks-import', ERROR) // 🟢
    .addRule('no-restricted-jest-methods', hasRestrictedMethods ? ERROR : OFF, [
      restrictedMethods || {},
    ])
    .addRule('no-restricted-matchers', hasRestrictedMatchers ? ERROR : OFF, [
      restrictedMatchers || {},
    ])
    .addRule('no-standalone-expect', ERROR) // 🟢
    .addRule('no-test-prefixes', ERROR) // 🟢
    .addRule('no-test-return-statement', ERROR)
    .addRule('padding-around-after-all-blocks', getPaddingAroundSeverity('afterAll'))
    .addRule('padding-around-after-each-blocks', getPaddingAroundSeverity('afterEach'))
    .addRule('padding-around-all', OFF)
    .addRule('padding-around-before-all-blocks', getPaddingAroundSeverity('beforeAll'))
    .addRule('padding-around-before-each-blocks', getPaddingAroundSeverity('beforeEach'))
    .addRule('padding-around-describe-blocks', getPaddingAroundSeverity('describe'))
    .addRule('padding-around-expect-groups', getPaddingAroundSeverity('expect'))
    .addRule('padding-around-test-blocks', getPaddingAroundSeverity('test'))
    .addRule('prefer-called-with', OFF)
    .addRule('prefer-comparison-matcher', ERROR)
    .addRule('prefer-each', WARNING)
    .addRule('prefer-equality-matcher', ERROR)
    .addRule('prefer-expect-assertions', OFF)
    .addRule('prefer-expect-resolves', ERROR)
    .addRule('prefer-hooks-in-order', ERROR)
    .addRule('prefer-hooks-on-top', ERROR)
    .addRule('prefer-importing-jest-globals', OFF)
    .addRule('prefer-jest-mocked', ERROR)
    .addRule('prefer-lowercase-title', ERROR)
    .addRule('prefer-mock-promise-shorthand', ERROR)
    .addRule('prefer-snapshot-hint', OFF)
    .addRule('prefer-spy-on', ERROR)
    .addRule('prefer-strict-equal', WARNING)
    .addRule('prefer-to-be', ERROR) // 🎨
    .addRule('prefer-to-contain', ERROR) // 🎨
    .addRule('prefer-to-have-length', ERROR) // 🎨
    .addRule('prefer-todo', WARNING)
    .addRule('require-hook', WARNING)
    .addRule('require-to-throw-message', OFF)
    .addRule('require-top-level-describe', OFF)
    .addRule('valid-describe-callback', ERROR)
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
    ])
    .addRule('valid-expect-in-promise', ERROR) // 🟢
    .addRule('valid-title', ERROR) // 🟢
    .addOverrides();

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
    .addRule('no-untyped-mock-factory', ERROR)
    // Requires type checking
    // TODO auto-include test files in TS config?
    .addRule('unbound-method', isTypescriptEnabled ? ERROR : OFF)
    // https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md#how-to-use
    .disableAnyRule('ts', 'unbound-method')
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
    .addRule('prefer-to-be-array', getSuggestUsingJestExtendedMatcherSeverity('toBeArray'))
    .addRule('prefer-to-be-false', getSuggestUsingJestExtendedMatcherSeverity('toBeFalse'))
    .addRule('prefer-to-be-object', getSuggestUsingJestExtendedMatcherSeverity('toBeObject'))
    .addRule('prefer-to-be-true', getSuggestUsingJestExtendedMatcherSeverity('toBeTrue'))
    .addRule(
      'prefer-to-have-been-called-once',
      getSuggestUsingJestExtendedMatcherSeverity('toHaveBeenCalledOnce'),
    );

  // TODO https://www.npmjs.com/package/eslint-plugin-jest-dom ?
  // Other plugins: eslint-plugin-jest-async, eslint-plugin-jest-formatting, eslint-plugin-jest-mock-config, eslint-plugin-jest-playwright, eslint-plugin-jest-react, eslint-plugin-jest-test-each-formatting

  return {
    configs: [configBuilder, configBuilderTypescript, configBuilderJestExtended],
    optionsResolved,
  };
};
