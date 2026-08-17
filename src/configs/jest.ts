import type {Jest as JestMethods} from '@jest/environment';
import type {AsymmetricMatchers, JestExpect} from '@jest/expect';
import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {pluginsLoaders} from '../loaders';
import type {ObjectValues, Prettify} from '../types';
import {allUnionMembers} from '../utils';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateConsistentTestItOptions,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type FlatConfigEntryForBuilder,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRuleOptionsByPlugin,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

type AllJestMatchers = Prettify<keyof ReturnType<JestExpect> | keyof AsymmetricMatchers>;

interface JestExtendedSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'jest-extended'> {
  /**
   * Suggests using various `jest-extended` methods instead of some assertion forms.
   *
   * ⚠️ If specified as object, unspecified options will be treated as if they were enabled (set to
   * `true`).
   *
   * Affected rules:
   * - [`jest-extended/prefer-to-be-array`](https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-array.md)
   *   (`toBeArray`)
   * - [`jest-extended/prefer-to-be-false`](https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-false.md)
   *   (`toBeFalse`)
   * - [`jest-extended/prefer-to-be-object`](https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-object.md)
   *   (`toBeObject`)
   * - [`jest-extended/prefer-to-be-true`](https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-be-true.md)
   *   (`toBeTrue`)
   * - [`jest-extended/prefer-to-have-been-called-once`](https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/prefer-to-have-been-called-once.md)
   *   (`toHaveBeenCalledOnce`)
   * @default true
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

/**
 * [Jest](https://jestjs.io) related rules.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
 */
export interface JestEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'jest'>,
    NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins> {
  /**
   * [`eslint-plugin-jest`](https://npmx.dev/eslint-plugin-jest) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings)
   * that will be assigned to `jest` property and applied to the resolved `files` and `ignores` of
   * this config, as well as for `ts` and `jestExtended` sub-configs.
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
     * Tell the plugin which major version of Jest is used, if it cannot be detected automatically
     * @see https://github.com/jest-community/eslint-plugin-jest?tab=readme-ov-file#jest-version-setting
     */
    version?: number;
  };

  /**
   * Suggests using `jest-extended` matchers instead of some assertion forms.
   *
   * 📁 Default `files`: same as the parent config's default `files`
   *
   * 🧩 Main plugin: [`eslint-plugin-jest-extended`](https://npmx.dev/eslint-plugin-jest-extended)
   * @default true <=> `jest-extended` package is installed
   */
  configJestExtended?: boolean | JestExtendedSubConfigOptions<ExtraPlugins>;

  /**
   * Explicitly specify or ignore files written in TypeScript.
   * Will be used to enable TypeScript-specific rules like
   * [`jest/no-untyped-mock-factory`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-untyped-mock-factory.md)
   * or
   * [`jest/unbound-method`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md).
   *
   * 📁 Default `files`: the parent config's default `files`, restricted to TypeScript extensions
   * @default true <=> `ts` config is enabled
   */
  configTypescript?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'jest'>, `jest/${JestRulesForTypescriptFiles}`>
      >;

  /**
   * Enforces the keyword tests are defined with.
   * Will be merged with the default value.
   * `false` disables the rule.
   *
   * When string, will be set for the properties of the object.
   *
   * Affected rule:
   * - [`jest/consistent-test-it`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/consistent-test-it.md)
   * @default {fn: 'it', withinDescribe: 'it'}
   */
  testDefinitionKeyword?:
    | GetRuleOptions<'jest', 'consistent-test-it'>
    | ObjectValues<GetRuleOptions<'jest', 'consistent-test-it'>>
    | false;

  /**
   * Enforces the maximum number of assertion calls a test may make.
   *
   * Affected rule:
   * - [`jest/max-expects`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/max-expects.md)
   * @default not enforced
   */
  maxAssertionCalls?: number;

  /**
   * Enforces the maximum depth of nested `describe` blocks.
   *
   * Affected rule:
   * - [`jest/max-nested-describe`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/max-nested-describe.md)
   * @default not enforced
   */
  maxNestedDescribes?: number;

  /**
   * Restricts the use of specific Jest methods.
   * "Restrictions are expressed in the form of a map, with the value being either a string message
   * to be shown, or `null` if a generic default message should be used." - from eslint-plugin-jest
   * docs
   *
   * Affected rule:
   * - [`jest/no-restricted-jest-methods`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-restricted-jest-methods.md)
   */
  restrictedMethods?: Partial<Record<keyof JestMethods | (string & {}), string | null>>;

  /**
   * Restricts the use of specific Jest matchers.
   * "Bans are expressed in the form of a map, with the value being either a string message to be
   * shown, or `null` if the default rule message should be used." - from eslint-plugin-jest docs
   *
   * Affected rule:
   * - [`jest/no-restricted-matchers`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-restricted-matchers.md)
   */
  restrictedMatchers?: Partial<Record<AllJestMatchers | (string & {}), string | null>>;

  /**
   * Enforces padding around Jest functions.
   *
   * ⚠️ If specified as object, unspecified options will be treated as if they were enabled (set to
   * `true`).
   *
   * Affected rules:
   * - [`jest/padding-around-after-all-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-after-all-blocks.md)
   *   (`afterAll`)
   * - [`jest/padding-around-after-each-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-after-each-blocks.md)
   *   (`afterEach`)
   * - [`jest/padding-around-before-all-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-before-all-blocks.md)
   *   (`beforeAll`)
   * - [`jest/padding-around-before-each-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-before-each-blocks.md)
   *   (`beforeEach`)
   * - [`jest/padding-around-describe-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-describe-blocks.md)
   *   (`describe`)
   * - [`jest/padding-around-expect-groups`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-expect-groups.md)
   *   (`expect`)
   * - [`jest/padding-around-test-blocks`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/padding-around-test-blocks.md)
   *   (`test`)
   * @default true
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
   * Allows specifying which matchers return promises, and so should be considered async when
   * checking if an `expect` should be returned or awaited.
   *
   * By default, this has a list of all the async matchers provided by jest-extended (namely,
   * toResolve and toReject).
   *
   * *(from Jest docs)*
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect.md#asyncmatchers
   */
  asyncMatchers?: string[];

  /**
   * Enforces the minimum and maximum number of arguments that `expect` can take, and is required to
   * take.
   *
   * This is useful when you're using libraries that increase the number of arguments supported by
   * expect, such as [jest-expect-message](https://npmx.dev/jest-expect-message).
   *
   * *(from Jest docs)*
   *
   * Values less than 0 will be ignored.
   * @default [1, 1]
   * @see https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect.md#minargs--maxargs
   */
  minAndMaxExpectArgs?: [min: number | undefined, max: number | undefined];
}

type JestRulesForTypescriptFiles = keyof Pick<
  UnRuleOptionsByPlugin['jest'],
  | 'no-error-equal'
  | 'no-unnecessary-assertion'
  | 'no-untyped-mock-factory'
  | 'unbound-method'
  | 'valid-expect-with-promise'
>;

const JEST_RULES_FOR_TYPESCRIPT_FILES_SET = new Set<string>(
  allUnionMembers<JestRulesForTypescriptFiles>()([
    'no-error-equal',
    'no-unnecessary-assertion',
    'no-untyped-mock-factory',
    'unbound-method',
    'valid-expect-with-promise',
  ]),
);

export default defineUnConfig<JestEslintConfigOptions>('jest', {enabledBy: {package: 'jest'}})(
  async (context, optionsRaw) => {
    const eslintPluginJest = await pluginsLoaders.jest(context).then(({module}) => module);
    const isJestExtendedInstalled = context.packagesInfo['jest-extended'] != null;

    const optionsResolved = assignDefaults(optionsRaw, {
      configJestExtended: isJestExtendedInstalled,
      configNoOnlyTests: false,
      configTypescript: context.configsMeta.ts.enabled,
      paddingAround: true,
    });

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
      languageOptions: {
        // Yes, `globals.globals` is required
        globals: eslintPluginJest?.environments.globals.globals,
      },
    };

    const defaultJestFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION);
    const defaultJestTypescriptFiles = generateDefaultTestFiles(GLOB_TS_X_EXTENSION);

    const hasRestrictedMethods = Object.keys(restrictedMethods || {}).length > 0;
    const hasRestrictedMatchers = Object.keys(restrictedMatchers || {}).length > 0;

    const getPaddingAroundSeverity = (key: keyof (typeof paddingAround & object)) =>
      paddingAround === true || (paddingAround && paddingAround[key] !== false) ? ERROR : OFF;

    const configBuilder = context.createConfigBuilder(optionsResolved, 'jest');

    // Legend:
    // 🟢 - in recommended
    // 🟡 - in recommended (warns)
    // 🎨 - in style
    // 💭 - requires type information

    configBuilder
      ?.addConfig(
        [
          'jest',
          {
            filesDefault: defaultJestFiles,
            settings: {
              jest: pluginSettings,
            },
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
      .addRule(
        'max-expects',
        maxAssertionCalls == null ? OFF : ERROR,
        maxAssertionCalls == null ? [] : [{max: maxAssertionCalls}],
      ) /** @since 26.6.0 */
      .addRule(
        'max-nested-describe',
        maxNestedDescribes == null ? OFF : ERROR,
        maxNestedDescribes == null ? [] : [{max: maxNestedDescribes}],
      ) /** @since 24.4.0 */
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
      .addRule('no-unneeded-async-expect-function', ERROR) /** @since 29.5.0 */
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
      .addRule('prefer-mock-return-shorthand', ERROR) /** @since 29.11.0 */
      .addRule('prefer-snapshot-hint', OFF) /** @since 26.1.0 */
      .addRule('prefer-spy-on', ERROR) /** @since 21.27.0 */
      .addRule('prefer-strict-equal', WARNING) /** @since 21.21.0 */
      .addRule('prefer-to-be', ERROR) /** @since 24.5.0 */ // 🎨
      .addRule('prefer-to-contain', ERROR) /** @since 21.25.0 */ // 🎨
      .addRule('prefer-to-have-been-called', OFF) /** @since 29.4.0 */
      .addRule('prefer-to-have-been-called-times', OFF) /** @since 29.4.0 */
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
      .addRule('valid-mock-module-path', ERROR) /** @since 29.2.0 */
      .addRule('valid-title', ERROR) /** @since 22.20.0 */ // 🟢
      .enableConfigTesterForPlugin('jest', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => JEST_RULES_FOR_TYPESCRIPT_FILES_SET.has(ruleName),
      })
      .addOverrides();

    const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
      context,
      'jest',
      configNoOnlyTests,
      optionsResolved,
      {filesDefault: defaultJestFiles},
    );

    const configBuilderTypescript = context.createConfigBuilder(configTypescript, 'jest');
    configBuilderTypescript
      ?.addConfig(
        [
          'jest/ts',
          {
            filesDefault: defaultJestTypescriptFiles,
            settings: {
              jest: pluginSettings,
            },
            skipTypeInfoSplit: true,
          },
        ],
        defaultJestEslintConfig,
      )
      .addRule('no-error-equal', ERROR) /** @since 29.7.0 */ // 💭
      .addRule('no-unnecessary-assertion', ERROR) /** @since 29.6.0 */ // 💭
      // Works only on TS files
      .addRule('no-untyped-mock-factory', ERROR) /** @since 27.2.0 */
      // https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/unbound-method.md#how-to-use
      .addRule('unbound-method', ERROR) /** @since 24.3.0 */ // 💭
      .disableAnyRule('ts', 'unbound-method')
      .addRule('valid-expect-with-promise', ERROR) /** @since 29.8.0 */ // 💭
      .enableConfigTesterForPlugin('jest', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !JEST_RULES_FOR_TYPESCRIPT_FILES_SET.has(ruleName),
      })
      .addOverrides();

    const configBuilderJestExtended = context.createConfigBuilder(
      configJestExtended,
      'jest-extended',
    );
    const {suggestUsing = true} = typeof configJestExtended === 'object' ? configJestExtended : {};

    const getSuggestUsingJestExtendedMatcherSeverity = (
      key: keyof (typeof suggestUsing & object),
    ) => (suggestUsing === true || (suggestUsing && suggestUsing[key] !== false) ? ERROR : OFF);

    configBuilderJestExtended
      ?.addConfig(
        [
          'jest/extended',
          {
            filesDefault: defaultJestFiles,
            settings: {
              jest: pluginSettings,
            },
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
      .enableConfigTesterForPlugin('jest-extended')
      .addOverrides();

    // TODO https://npmx.dev/eslint-plugin-jest-dom ?
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
  },
);
