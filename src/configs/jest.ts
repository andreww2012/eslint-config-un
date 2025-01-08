import type {Jest as JestMethods} from '@jest/environment';
import type {AsymmetricMatchers, JestExpect} from '@jest/expect';
import eslintPluginJest from 'eslint-plugin-jest';
// @ts-expect-error no typings
import eslintPluginJestExtended from 'eslint-plugin-jest-extended';
import {getPackageInfoSync} from 'local-pkg';
import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type FlatConfigEntry,
  type FlatConfigEntryForBuilder,
  type GetRuleOptions,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import type {InternalConfigOptions} from './index';

type AllJestMatchers = PrettifyShallow<keyof ReturnType<JestExpect> | keyof AsymmetricMatchers>;

export const generateDefaultTestFiles = <T extends string>(extensions: T) => [
  `**/*.spec.${extensions}` as const, // GitHub: 2.3M .ts files as of 2024-12-08 (https://github.com/search?q=path%3A**%2F*.spec.ts&type=code&query=path%3A%2F**%2F__tests__%2F**%2F*.ts)
  `**/*.test.${extensions}` as const, // 1.9M
  `__tests__/**/*.${extensions}` as const, // 155k
  `__test__/**/*.${extensions}` as const, // 14k
];

export interface JestEslintConfigOptions extends ConfigSharedOptions<'jest'> {
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
   * Explicitly specify or ignore files written in TypeScript. Will be used to enable TypeScript-specific rules like [`no-untyped-mock-factory`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-untyped-mock-factory.md) or [`unbound-method`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md).
   * @default `true` if TypeScript (`ts`) config is enabled
   */
  typescript?: boolean | PrettifyShallow<ConfigSharedOptions<'jest'>>;

  /**
   * Enables or specifies the configuration for the [`jest-extended`](https://github.com/jest-community/eslint-plugin-jest-extended) plugin.
   * @default `true` if `jest-extended` package is installed
   */
  jestExtended?:
    | boolean
    | PrettifyShallow<
        ConfigSharedOptions<'jest-extended'> & {
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
   * Will be merged with the default value. `false` disables the rule.
   * @default {fn: 'it', withinDescribe: 'it'}
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/consistent-test-it.md
   */
  testDefinitionKeyword?: GetRuleOptions<'jest/consistent-test-it'>[0] | false;

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

export const jestEslintConfig = (
  options: JestEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const {
    settings: pluginSettings,
    testDefinitionKeyword,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    paddingAround = true,
    asyncMatchers,
    minAndMaxExpectArgs,
    typescript: typescriptOnlyRules = internalOptions.isTypescriptEnabled,
    jestExtended = getPackageInfoSync('jest-extended') != null,
  } = options;

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

  const builder = new ConfigEntryBuilder<'jest'>(options, internalOptions);

  // Legend:
  // 🟢 - in Recommended
  // 🎨 - in Style

  builder.addConfig('jest/setup', {
    plugins: {
      jest: eslintPluginJest,
    },
  });
  builder.addConfig('jest/extended/setup', {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      'jest-extended': eslintPluginJestExtended,
    },
  });

  builder
    .addConfig(
      [
        'jest',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: defaultJestFiles,
        },
      ],
      {
        ...defaultJestEslintConfig,
      },
    )
    .addBulkRules(eslintPluginJest.configs['flat/recommended'].rules)
    .addRule('jest/consistent-test-it', testDefinitionKeyword === false ? OFF : ERROR, [
      {
        fn: 'it',
        withinDescribe: 'it',
        ...testDefinitionKeyword,
      },
    ])
    .addRule('jest/expect-expect', ERROR) // 🟢 (warns)
    .addRule('jest/max-expects', maxAssertionCalls == null ? OFF : ERROR, [
      {max: maxAssertionCalls},
    ])
    .addRule('jest/max-nested-describe', maxNestedDescribes == null ? OFF : ERROR, [
      {max: maxNestedDescribes},
    ])
    // .addRule('jest/no-alias-methods', ERROR) // 🟢 🎨
    .addRule('jest/no-commented-out-tests', WARNING) // 🎨 (warns)
    // .addRule('jest/no-conditional-expect', ERROR) // 🟢
    // .addRule('jest/no-conditional-in-test', OFF)
    .addRule('jest/no-confusing-set-timeout', ERROR)
    // .addRule('jest/no-deprecated-functions', ERROR) // 🟢
    // .addRule('jest/no-disabled-tests', WARNING) // 🟢 (warns)
    // .addRule('jest/no-done-callback', ERROR) // 🟢
    .addRule('jest/no-duplicate-hooks', ERROR)
    // .addRule('jest/no-export', ERROR) // 🟢
    // .addRule('jest/no-focused-tests', ERROR) // 🟢
    // .addRule('jest/no-hooks', OFF)
    // .addRule('jest/no-identical-title', ERROR) // 🟢
    // .addRule('jest/no-interpolation-in-snapshots', ERROR) // 🟢
    // .addRule('jest/no-jasmine-globals', ERROR) // 🟢
    // .addRule('jest/no-large-snapshots', OFF)
    // .addRule('jest/no-mocks-import', ERROR) // 🟢
    .addRule('jest/no-restricted-jest-methods', hasRestrictedMethods ? ERROR : OFF, [
      restrictedMethods || {},
    ])
    .addRule('jest/no-restricted-matchers', hasRestrictedMatchers ? ERROR : OFF, [
      restrictedMatchers || {},
    ])
    // .addRule('jest/no-standalone-expect', ERROR) // 🟢
    // .addRule('jest/no-test-prefixes', ERROR) // 🟢
    .addRule('jest/no-test-return-statement', ERROR)
    .addRule('jest/padding-around-after-all-blocks', getPaddingAroundSeverity('afterAll'))
    .addRule('jest/padding-around-after-each-blocks', getPaddingAroundSeverity('afterEach'))
    // .addRule('jest/padding-around-all', OFF)
    .addRule('jest/padding-around-before-all-blocks', getPaddingAroundSeverity('beforeAll'))
    .addRule('jest/padding-around-before-each-blocks', getPaddingAroundSeverity('beforeEach'))
    .addRule('jest/padding-around-describe-blocks', getPaddingAroundSeverity('describe'))
    .addRule('jest/padding-around-expect-groups', getPaddingAroundSeverity('expect'))
    .addRule('jest/padding-around-test-blocks', getPaddingAroundSeverity('test'))
    // .addRule('jest/prefer-called-with', OFF)
    .addRule('jest/prefer-comparison-matcher', ERROR)
    .addRule('jest/prefer-each', WARNING)
    .addRule('jest/prefer-equality-matcher', ERROR)
    .addRule('jest/prefer-expect-assertions', OFF)
    .addRule('jest/prefer-expect-resolves', ERROR)
    .addRule('jest/prefer-hooks-in-order', ERROR)
    .addRule('jest/prefer-hooks-on-top', ERROR)
    // .addRule('jest/prefer-importing-jest-globals', OFF)
    .addRule('jest/prefer-jest-mocked', ERROR)
    .addRule('jest/prefer-lowercase-title', ERROR)
    .addRule('jest/prefer-mock-promise-shorthand', ERROR)
    // .addRule('jest/prefer-snapshot-hint', OFF)
    .addRule('jest/prefer-spy-on', ERROR)
    .addRule('jest/prefer-strict-equal', WARNING)
    .addRule('jest/prefer-to-be', ERROR) // 🎨
    .addRule('jest/prefer-to-contain', ERROR) // 🎨
    .addRule('jest/prefer-to-have-length', ERROR) // 🎨
    .addRule('jest/prefer-todo', WARNING)
    .addRule('jest/require-hook', WARNING)
    .addRule('jest/require-to-throw-message', OFF)
    .addRule('jest/require-top-level-describe', OFF)
    // .addRule('jest/valid-describe-callback', ERROR)
    .addRule('jest/valid-expect', ERROR, [
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
    .addRule('jest/valid-expect-in-promise', ERROR)
    .addRule('jest/valid-title', ERROR)
    .addOverrides();

  const tsBuilder = new ConfigEntryBuilder<'jest'>(
    typeof typescriptOnlyRules === 'object' ? typescriptOnlyRules : {},
    internalOptions,
  );
  if (typescriptOnlyRules) {
    builder
      .addConfig(
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
      .addRule('jest/no-untyped-mock-factory', ERROR)
      // Requires type checking
      // TODO auto-include test files in TS config?
      .addRule('jest/unbound-method', internalOptions.isTypescriptEnabled ? ERROR : OFF, [], {
        // https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md#how-to-use
        overrideBaseRule: '@typescript-eslint/unbound-method',
      })
      .addOverrides();
  }

  const jestExtendedBuilder = new ConfigEntryBuilder<'jest-extended'>(
    typeof jestExtended === 'object' ? jestExtended : {},
    internalOptions,
  );
  if (jestExtended) {
    const {suggestUsing} = typeof jestExtended === 'object' ? jestExtended : {};

    const getSuggestUsingJestExtendedMatcherSeverity = (
      key: keyof (typeof suggestUsing & object),
    ) => (suggestUsing === true || (suggestUsing && suggestUsing[key] !== false) ? ERROR : OFF);

    jestExtendedBuilder
      .addConfig(
        [
          'jest/extended',
          {
            includeDefaultFilesAndIgnores: true,
            filesFallback: defaultJestFiles,
          },
        ],
        {
          ...defaultJestEslintConfig,
        },
      )
      // Actually empty currently
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      .addBulkRules(eslintPluginJestExtended.configs['flat/recommended'].rules)
      .addRule(
        'jest-extended/prefer-to-be-array',
        getSuggestUsingJestExtendedMatcherSeverity('toBeArray'),
      )
      .addRule(
        'jest-extended/prefer-to-be-false',
        getSuggestUsingJestExtendedMatcherSeverity('toBeFalse'),
      )
      .addRule(
        'jest-extended/prefer-to-be-object',
        getSuggestUsingJestExtendedMatcherSeverity('toBeObject'),
      )
      .addRule(
        'jest-extended/prefer-to-be-true',
        getSuggestUsingJestExtendedMatcherSeverity('toBeTrue'),
      )
      .addRule(
        'jest-extended/prefer-to-have-been-called-once',
        getSuggestUsingJestExtendedMatcherSeverity('toHaveBeenCalledOnce'),
      );
  }

  // TODO https://www.npmjs.com/package/eslint-plugin-jest-dom ?
  // Other plugins: eslint-plugin-jest-async, eslint-plugin-jest-formatting, eslint-plugin-jest-mock-config, eslint-plugin-jest-playwright, eslint-plugin-jest-react, eslint-plugin-jest-test-each-formatting

  return [
    ...builder.getAllConfigs(),
    ...tsBuilder.getAllConfigs(),
    ...jestExtendedBuilder.getAllConfigs(),
  ];
};
