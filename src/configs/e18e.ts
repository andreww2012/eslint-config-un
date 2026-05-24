// cspell:ignore canparse
import {ERROR, GLOB_PACKAGE_JSON, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

const E18E_RULES_MODERNIZATION = [
  'prefer-array-at',
  'prefer-array-fill',
  'prefer-array-to-reversed',
  'prefer-array-to-sorted',
  'prefer-array-to-spliced',
  'prefer-exponentiation-operator',
  'prefer-includes',
  'prefer-nullish-coalescing',
  'prefer-object-has-own',
  'prefer-spread-syntax',
  'prefer-url-canparse',
] as const satisfies GetRuleNamesInPlugin<'e18e'>[];
const E18E_RULES_MODERNIZATION_SET = new Set<string>(E18E_RULES_MODERNIZATION);
type E18eModernizationRules = (typeof E18E_RULES_MODERNIZATION)[number];

const E18E_RULES_MODULE_REPLACEMENTS = [
  'ban-dependencies',
] as const satisfies GetRuleNamesInPlugin<'e18e'>[];
const E18E_RULES_MODULE_REPLACEMENTS_SET = new Set<string>(E18E_RULES_MODULE_REPLACEMENTS);
type E18eModuleReplacementsRules = (typeof E18E_RULES_MODULE_REPLACEMENTS)[number];

const E18E_RULES_PERFORMANCE_IMPROVEMENTS = [
  'no-delete-property',
  'no-indexof-equality',
  'no-spread-in-reduce',
  'prefer-array-from-map',
  'prefer-array-some',
  'prefer-date-now',
  'prefer-includes-over-regex-test',
  'prefer-inline-equality',
  'prefer-regex-test',
  'prefer-static-collator',
  'prefer-static-regex',
  'prefer-string-fromcharcode',
  'prefer-timer-args',
] as const satisfies GetRuleNamesInPlugin<'e18e'>[];
const E18E_RULES_PERFORMANCE_IMPROVEMENTS_SET = new Set<string>(
  E18E_RULES_PERFORMANCE_IMPROVEMENTS,
);
type E18ePerformanceImprovementsRules = (typeof E18E_RULES_PERFORMANCE_IMPROVEMENTS)[number];

type AllE18eRules = keyof UnRulesConfigPartial<'e18e'>;

'' as Exclude<
  AllE18eRules,
  `e18e/${E18eModernizationRules | E18eModuleReplacementsRules | E18ePerformanceImprovementsRules}`
> satisfies never;

export interface E18eEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * "New syntax and APIs which improve code readability and performance"
   * \- [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: all files
   * @default true
   */
  configModernization?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'e18e'>, `e18e/${E18eModernizationRules}`>
      >;

  /**
   * "Community recommended alternatives to popular libraries, focused on performance and size"
   * \- [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   * @default true
   */
  configModuleReplacements?:
    | boolean
    | (UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'e18e'>, `e18e/${E18eModuleReplacementsRules}`>
      > & {
        /**
         * Options of the only rule in this sub-config, `e18e/ban-dependencies`,
         */
        options?: GetRuleOptions<'e18e', 'ban-dependencies'>;
      });

  /**
   * "Patterns that can be optimized for better runtime performance"
   * \- [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: all files
   *
   * 💭
   * @default true
   */
  configPerformanceImprovements?:
    | boolean
    | UnFlatConfigEntryBase<
        ExtraPlugins,
        Pick<UnRulesConfigPartial<'e18e'>, `e18e/${E18ePerformanceImprovementsRules}`>
      >;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configModernization: true,
    configModuleReplacements: true,
    configPerformanceImprovements: true,
  });

  const {configModernization, configModuleReplacements, configPerformanceImprovements} =
    optionsResolved;

  // Legend:
  // 🔴 - NOT in recommended
  // 💭 - requires type information
  // 💭? - optionally requires type information

  const configBuilderModernization = context.createConfigBuilder(configModernization, 'e18e');

  if (configModernization) {
    configBuilderModernization
      ?.addConfig([
        'e18e/modernization',
        {
          includeDefaultFilesAndIgnores: true,
        },
      ])
      .addRule('prefer-array-at', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-fill', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-to-reversed', ERROR) /** @since 0.0.1 */ // 💭?
      .addRule('prefer-array-to-sorted', ERROR) /** @since 0.0.1 */ // 💭?
      .addRule('prefer-array-to-spliced', ERROR) /** @since 0.0.1 */
      .addRule('prefer-exponentiation-operator', ERROR) /** @since 0.0.1 */
      .addRule('prefer-includes', ERROR) /** @since 0.0.1 */
      .addRule('prefer-nullish-coalescing', ERROR) /** @since 0.0.1 */
      .addRule('prefer-object-has-own', ERROR) /** @since 0.0.1 */
      .addRule('prefer-spread-syntax', ERROR) /** @since 0.0.1 */
      .addRule('prefer-url-canparse', ERROR) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !E18E_RULES_MODERNIZATION_SET.has(ruleName),
      })
      .addOverrides();
  }

  const configBuilderModuleReplacements = context.createConfigBuilder(
    configModuleReplacements,
    'e18e',
  );

  if (configModuleReplacements) {
    const configModuleReplacementsOptions = assignDefaults(configModuleReplacements, {});

    const {options: badDependencyOptions} = configModuleReplacementsOptions;

    configBuilderModuleReplacements
      ?.addConfig([
        'e18e/module-replacements',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: [GLOB_PACKAGE_JSON],
          language: ['jsonc', 'json'],
        },
      ])
      .addRule(
        'ban-dependencies',
        ERROR,
        badDependencyOptions ? [badDependencyOptions] : [],
      ) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !E18E_RULES_MODULE_REPLACEMENTS_SET.has(ruleName),
      })
      .addOverrides();
  }

  const configBuilderPerformanceImprovements = context.createConfigBuilder(
    configPerformanceImprovements,
    'e18e',
  );

  if (configPerformanceImprovements) {
    configBuilderPerformanceImprovements
      ?.addConfig([
        'e18e/performance-improvements',
        {
          includeDefaultFilesAndIgnores: true,
        },
      ])
      .addRule('no-delete-property', OFF) /** @since 0.5.0 */ // 🔴
      .addRule('no-indexof-equality', ERROR) /** @since 0.0.1 */ // 🔴💭
      .addRule('no-spread-in-reduce', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-array-from-map', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-some', ERROR) /** @since 0.1.4 */
      .addRule('prefer-date-now', ERROR) /** @since 0.1.3 */
      .addRule('prefer-includes-over-regex-test', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-inline-equality', ERROR) /** @since 0.2.0 */ // 💭?
      .addRule('prefer-regex-test', ERROR) /** @since 0.1.3 */ // 💭?
      .addRule('prefer-static-collator', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-static-regex', ERROR) /** @since 0.2.0 */
      .addRule('prefer-string-fromcharcode', ERROR) /** @since 0.5.0 */
      .addRule('prefer-timer-args', ERROR) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !E18E_RULES_PERFORMANCE_IMPROVEMENTS_SET.has(ruleName),
      })
      .addOverrides();
  }

  return {
    configs: [
      configBuilderModernization,
      configBuilderModuleReplacements,
      configBuilderPerformanceImprovements,
    ],
    optionsResolved,
  };
}) satisfies UnConfigFn<'e18e'> as UnConfigFn<'e18e'>;
