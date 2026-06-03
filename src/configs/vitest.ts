import {ERROR, GLOB_JS_TS_X_EXTENSION, GLOB_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {pluginsLoaders} from '../loaders';
import type {Prettify} from '../types';
import {allUnionMembers} from '../utils';
import type {JestEslintConfigOptions} from './jest';
import {
  type NoOnlyTestsSubConfigDisabledByDefault,
  generateConfigNoOnlyTestsBuilder,
  generateConsistentTestItOptions,
  generateDefaultTestFiles,
} from './shared';
import {
  type ExtraPluginsType,
  type FlatConfigEntryForBuilder,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

type ConsistentEachForRuleOptions = GetRuleOptions<'vitest', 'consistent-each-for'>;
type EachOrFor = 'each' | 'for';
const FUNCTIONS_WITH_EACH_OR_FOR = allUnionMembers<keyof ConsistentEachForRuleOptions>()([
  'describe',
  'it',
  'suite',
  'test',
]);

export interface VitestEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'vitest'>,
    // TODO options jsdocs contain jest-related information
    Pick<
      JestEslintConfigOptions<ExtraPlugins>,
      | 'testDefinitionKeyword'
      | 'maxAssertionCalls'
      | 'maxNestedDescribes'
      | 'restrictedMethods'
      | 'restrictedMatchers'
      | 'asyncMatchers'
      | 'minAndMaxExpectArgs'
      | 'paddingAround'
    >,
    NoOnlyTestsSubConfigDisabledByDefault<ExtraPlugins> {
  /**
   * [`@vitest/eslint-plugin`](https://npmx.dev/@vitest/eslint-plugin) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `vitest` property
   * and applied to the resolved `files` and `ignores` of this config,
   * as well as for `ts` sub-config.
   */
  settings?: {
    /**
     * You must set this to `true` if you're using
     * [type testing vitest feature](https://vitest.dev/guide/testing-types).
     * @see https://github.com/vitest-dev/eslint-plugin-vitest?tab=readme-ov-file#enabling-with-type-testing
     */
    typecheck?: boolean;
  };

  /**
   * Explicitly specify or ignore files written in TypeScript.
   * Will be used to enable TypeScript-specific rules like
   * [`unbound-method`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/unbound-method.md).
   * @default true <=> `ts` config is enabled
   */
  configTypescript?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<
          UnRulesConfigPartial<'vitest'>,
          `vitest/${(typeof VITEST_RULES_REQUIRING_TYPE_INFORMATION)[number]}`
        >
      >;

  /**
   * Prefer [`.each`](https://vitest.dev/api/#test-each) or [`.for`](https://vitest.dev/api/#test-for). Note these are not the same. Possible options:
   * - `each` or `for`: prefer the specified method in all cases.
   * - object: configure which method to prefer for different test function types
   * (`test`, `it`, `describe`, `suite`). You may also set the `default` property
   * to specify the preferred by default method, otherwise if not explicitly specified,
   * both will be allowed.
   * - `false`: no enforcement.
   *
   * Affected rule:
   * - [`consistent-each-for`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/consistent-each-for.md)
   * @default 'each'
   */
  enforceEachOrFor?:
    | false
    | EachOrFor
    | Prettify<ConsistentEachForRuleOptions & {default?: EachOrFor}>;

  /**
   * - `once`: prefer `toBeCalledOnce()` or `toHaveBeenCalledOnce()` over `toBeCalledTimes(1)`
   * or `toHaveBeenCalledTimes(1)`.
   * - `times`: prefer the opposite.
   * - `false`: do not enforce any style.
   *
   * Affected rules:
   * - [`prefer-called-once`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-once.md)
   * - [`prefer-called-times`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-times.md)
   * @default 'once'
   */
  enforceToBeCalledStyle?: false | 'once' | 'times';

  /**
   * Enforces whether importing [Vitest globals](https://vitest.dev/config/#globals)
   * is required or disallowed.
   *
   * Affected rules:
   * - [`no-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-importing-vitest-globals.md)
   * - [`prefer-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-importing-vitest-globals.md)
   * @default 'disallow'
   */
  vitestGlobalsImporting?: 'disallow' | 'enforce' | 'any';
}

const VITEST_RULES_REQUIRING_TYPE_INFORMATION = [
  'unbound-method',
] satisfies GetRuleNamesInPlugin<'vitest'>[];

const VITEST_RULES_REQUIRING_TYPE_INFORMATION_SET = new Set<string>(
  VITEST_RULES_REQUIRING_TYPE_INFORMATION,
);

export default (async (context, optionsRaw) => {
  const eslintPluginVitest = await pluginsLoaders.vitest(context).then(({module}) => module);

  context.usedPlugins.add('vitest');
  /* v8 ignore start */
  if (!eslintPluginVitest) {
    return null;
  }
  /* v8 ignore stop */

  const isTsConfigEnabled = context.configsMeta.ts.enabled;

  const optionsResolved = assignDefaults(optionsRaw, {
    configNoOnlyTests: false,
    configTypescript: isTsConfigEnabled,
    enforceEachOrFor: 'each',
    enforceToBeCalledStyle: 'once',
    vitestGlobalsImporting: 'disallow',
    paddingAround: true,
  });

  const {
    settings: pluginSettings,
    configNoOnlyTests,
    configTypescript,
    enforceEachOrFor,
    enforceToBeCalledStyle,
    maxAssertionCalls,
    maxNestedDescribes,
    restrictedMethods,
    restrictedMatchers,
    asyncMatchers,
    minAndMaxExpectArgs,
    vitestGlobalsImporting,
    paddingAround,
  } = optionsResolved;

  const vitestMajorVersion = context.packagesInfo.vitest?.versions.major;

  const defaultVitestEslintConfig: FlatConfigEntryForBuilder = {
    languageOptions: {
      // TODO why `eslint-plugin-vitest-globals` is used instead of this?
      globals: eslintPluginVitest.environments.env.globals,
    },
  };

  const defaultVitestFiles = generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
    includeVitestBenchmarkFiles: true,
  });
  const defaultVitestTypescriptFiles = generateDefaultTestFiles(GLOB_TS_X_EXTENSION, {
    includeVitestBenchmarkFiles: true,
  });

  const hasRestrictedMethods = Object.keys(restrictedMethods || {}).length > 0;
  const hasRestrictedMatchers = Object.keys(restrictedMatchers || {}).length > 0;

  const getPaddingAroundSeverity = (key: keyof (typeof paddingAround & object)) =>
    paddingAround === true || (paddingAround && paddingAround[key] !== false) ? ERROR : OFF;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'vitest');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 💭 - requires type information

  // TODO sync settings with `jest` config?
  configBuilder
    ?.addConfig(
      [
        'vitest',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: defaultVitestFiles,
          settings: {
            vitest: pluginSettings,
          },
        },
      ],
      defaultVitestEslintConfig,
    )
    .addRule(
      'consistent-each-for',
      enforceEachOrFor === false ? OFF : ERROR,
      enforceEachOrFor === false
        ? []
        : [
            Object.fromEntries(
              FUNCTIONS_WITH_EACH_OR_FOR.map((fnName) => [
                fnName,
                typeof enforceEachOrFor === 'string'
                  ? enforceEachOrFor
                  : (enforceEachOrFor[fnName] ?? enforceEachOrFor.default),
              ]),
            ),
          ],
    ) /** @since 1.4.4 */ // (warns in all)
    .addRule('consistent-test-filename', OFF) /** @since 0.0.47 */
    .addRule(
      'consistent-test-it',
      optionsResolved.testDefinitionKeyword === false ? OFF : ERROR,
      optionsResolved.testDefinitionKeyword === false
        ? []
        : generateConsistentTestItOptions(optionsResolved),
    ) /** @since 0.0.29 */
    .addRule('consistent-vitest-vi', ERROR) /** @since 1.2.5 */ // (warns in all)
    .addRule('expect-expect', ERROR) /** @since 0.0.17 */ // 🟢
    .addRule('hoisted-apis-on-top', ERROR) /** @since 1.3.7 */ // (warns in all)
    .addRule('max-expects', maxAssertionCalls == null ? OFF : ERROR, [
      {max: maxAssertionCalls},
    ]) /** @since 0.0.49 */
    .addRule(
      'max-nested-describe',
      maxNestedDescribes == null ? OFF : ERROR,
      maxNestedDescribes == null ? [] : [{max: maxNestedDescribes}],
    ) /** @since 0.0.8 */
    .addRule('no-alias-methods', ERROR) /** @since 0.0.49 */ // (warns in all)
    .addRule('no-commented-out-tests', WARNING) /** @since 0.0.49 */ // 🟢
    .addRule('no-conditional-expect', ERROR, [
      {expectAssertions: true /** @since 1.6.5 */},
    ]) /** @since 0.0.49 */ // 🟢(since 1.5.0)
    .addRule('no-conditional-in-test', OFF) /** @since 0.0.8 */ // (warns in all) Maybe got removed and re-added in 0.0.49
    .addRule('no-conditional-tests', ERROR) /** @since 0.0.16 */ // (warns in all)
    .addRule('no-disabled-tests', WARNING) /** @since 0.0.49 */ // 🟡(since 1.5.0)
    .addRule('no-duplicate-hooks', ERROR) /** @since 0.0.49 */ // (warns in all)
    .addRule('no-focused-tests', ERROR, [{fixable: false}]) /** @since 0.0.13 */ // 🟢(since 1.5.0)
    .addRule('no-hooks', OFF) /** @since 0.0.35 */ // (warns in all)
    .addRule('no-identical-title', ERROR) /** @since 0.0.8 */ /** @aka no-idential-title */ // 🟢 cspell:disable-line
    .addRule('no-import-node-test', ERROR) /** @since 0.3.14 */ // 🟢
    .addRule(
      'no-importing-vitest-globals',
      vitestGlobalsImporting === 'disallow' ? ERROR : OFF,
    ) /** @since 1.2.3 */ // (warns in all)
    .addRule('no-interpolation-in-snapshots', ERROR) /** @since 0.0.54 */ // 🟢(since 1.5.0)
    .addRule('no-large-snapshots', OFF) /** @since 0.0.54 */ // (warns in all)
    .addRule('no-mocks-import', ERROR) /** @since 0.0.54 */ // 🟢(since 1.5.0)
    .addRule(
      'no-restricted-matchers',
      hasRestrictedMatchers ? ERROR : OFF,
      /* v8 ignore next */
      hasRestrictedMatchers ? [restrictedMatchers || {}] : [],
    ) /** @since 0.0.54 */
    .addRule(
      'no-restricted-vi-methods',
      hasRestrictedMethods ? ERROR : OFF,
      /* v8 ignore next */
      hasRestrictedMethods ? [restrictedMethods || {}] : [],
    ) /** @since 0.0.43 */
    .addRule('no-standalone-expect', ERROR) /** @since 0.0.54 */ // 🟢(since 1.5.0)
    .addRule('no-test-prefixes', ERROR) /** @since 0.0.54 */ // (warns in all)
    .addRule('no-test-return-statement', ERROR) /** @since 0.0.54 */ // (warns in all)
    .addRule('no-unneeded-async-expect-function', ERROR) /** @since 1.5.3 */ // 🟢
    .addRule(
      'padding-around-after-all-blocks',
      getPaddingAroundSeverity('afterAll'),
    ) /** @since 1.1.0 */ // (warns in all)
    .addRule(
      'padding-around-after-each-blocks',
      getPaddingAroundSeverity('afterEach'),
    ) /** @since 1.1.0 */ // (warns in all)
    .addRule('padding-around-all', OFF) /** @since 1.1.0 */ // (warns in all)
    .addRule(
      'padding-around-before-all-blocks',
      getPaddingAroundSeverity('beforeAll'),
    ) /** @since 1.1.0 */ // (warns in all)
    .addRule(
      'padding-around-before-each-blocks',
      getPaddingAroundSeverity('beforeEach'),
    ) /** @since 1.1.0 */ // (warns in all)
    .addRule(
      'padding-around-describe-blocks',
      getPaddingAroundSeverity('describe'),
    ) /** @since 1.1.0 */ // (warns in all)
    .addRule('padding-around-expect-groups', getPaddingAroundSeverity('expect')) /** @since 1.1.0 */ // (warns in all)
    .addRule('padding-around-test-blocks', getPaddingAroundSeverity('test')) /** @since 1.1.0 */ // (warns in all)
    .addRule(
      'prefer-called-exactly-once-with',
      (vitestMajorVersion || 0) >= 3 ? ERROR : OFF,
    ) /** @since 0.3.18 */ // 🟢 Maybe got removed and re-added in 1.3.14
    .addRule(
      'prefer-called-once',
      enforceToBeCalledStyle === 'once' ? ERROR : OFF,
    ) /** @since 1.3.3 */ // (off in all)
    .addRule(
      'prefer-called-times',
      enforceToBeCalledStyle === 'times' ? ERROR : OFF,
    ) /** @since 1.3.3 */ // (warns in all)
    .addRule('prefer-called-with', OFF) /** @since 0.0.54 */ // (warns in all)
    .addRule('prefer-comparison-matcher', ERROR) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-describe-function-title', OFF) /** @since 1.1.41 */
    .addRule('prefer-each', WARNING) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-equality-matcher', ERROR) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-expect-assertions', OFF) /** @since 0.3.18 */ // (warns in all)
    .addRule('prefer-expect-resolves', ERROR) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-expect-type-of', ERROR) /** @since 1.3.6 */ // (warns in all)
    .addRule('prefer-hooks-in-order', ERROR) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-hooks-on-top', ERROR) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-import-in-mock', ERROR, [
      {fixable: false /** @since 1.6.3 */},
    ]) /** @since 1.3.15 */ // (warns in all)
    .addRule(
      'prefer-importing-vitest-globals',
      vitestGlobalsImporting === 'enforce' ? ERROR : OFF,
    ) /** @since 1.2.3 */ // (warns in all)
    .addRule('prefer-lowercase-title', ERROR) /** @since 0.0.5 */ /** @aka lower-case-title */ // (warns in all)
    .addRule(
      'prefer-mock-promise-shorthand',
      ERROR,
    ) /** @since 0.1.0 */ /** @aka preferMockPromiseShorthand */ // (warns in all)
    .addRule('prefer-mock-return-shorthand', ERROR) /** @since 1.6.4 */
    .addRule('prefer-snapshot-hint', OFF) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-spy-on', ERROR) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-strict-boolean-matchers', OFF) /** @since 1.1.26 */
    .addRule('prefer-strict-equal', WARNING) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-to-be', ERROR) /** @since 0.0.32 */ // (warns in all)
    .addRule('prefer-to-be-falsy', OFF) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-to-be-object', ERROR) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-to-be-truthy', OFF) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-to-contain', ERROR) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-to-have-been-called-times', ERROR) /** @since 1.6.1 */ // (warns in all)
    .addRule('prefer-to-have-length', ERROR) /** @since 0.0.57 */ // (warns in all)
    .addRule('prefer-todo', WARNING) /** @since 0.1.0 */ // (warns in all)
    .addRule('prefer-vi-mocked', OFF) /** @since 1.1.6 */ // 💭 (warns in all)
    .addRule('require-awaited-expect-poll', WARNING) /** @since 1.4.2 */ // (warns in all)
    .addRule('require-hook', WARNING) /** @since 0.1.0 */ // (warns in all)
    .addRule('require-local-test-context-for-concurrent-snapshots', ERROR) /** @since 0.3.13 */ // 🟢
    .addRule('require-mock-type-parameters', WARNING) /** @since 1.1.27 */
    .addRule('require-test-timeout', OFF) /** @since 1.6.6 */
    .addRule('require-to-throw-message', OFF) /** @since 0.1.0 */ // (warns in all)
    .addRule('require-top-level-describe', OFF) /** @since 0.1.0 */ // (warns in all)
    .addRule('valid-describe-callback', ERROR) /** @since 0.1.0 */ // 🟢
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
    ]) /** @since 0.0.55 */ // 🟢
    .addRule('valid-expect-in-promise', ERROR) /** @since 1.1.9 */ // 🟢(since 1.5.0)
    .addRule('valid-title', ERROR) /** @since 0.0.54 */ // 🟢
    .addRule('warn-todo', WARNING) /** @since 1.3.3 */
    .enableConfigTesterForPlugin('vitest', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => VITEST_RULES_REQUIRING_TYPE_INFORMATION_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderTypescript = context.createConfigBuilder(configTypescript, 'vitest');
  configBuilderTypescript
    ?.addConfig(
      [
        'vitest/ts',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: defaultVitestTypescriptFiles,
          settings: {
            vitest: pluginSettings,
          },
          skipTypeInfoSplit: true,
        },
      ],
      defaultVitestEslintConfig,
    )
    .addRule('unbound-method', ERROR) /** @since 1.6.13 */ // 💭 (warns in all)
    .disableAnyRule('ts', 'unbound-method')
    .enableConfigTesterForPlugin('vitest', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => !VITEST_RULES_REQUIRING_TYPE_INFORMATION_SET.has(ruleName),
    })
    .addOverrides();

  const configBuilderNoOnlyTests = generateConfigNoOnlyTestsBuilder(
    context,
    'vitest',
    configNoOnlyTests,
    optionsResolved,
    {filesDefault: defaultVitestFiles},
  );

  return {
    configs: [configBuilder, configBuilderTypescript, configBuilderNoOnlyTests],
    optionsResolved,
  };
}) satisfies UnConfigFn<'vitest'> as UnConfigFn<'vitest'>;
