// cspell:ignore canparse charcode
import {ERROR, GLOB_PACKAGE_JSON, OFF} from '../constants';
import {RULE_CATEGORIES_PER_PLUGIN} from '../eslint-rule-categories.gen';
import {arrayIncludes} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

const RULE_CATEGORIES = RULE_CATEGORIES_PER_PLUGIN.e18e;

type SubConfigOptions<
  ExtraPlugins extends ExtraPluginsType,
  Category extends keyof typeof RULE_CATEGORIES,
> = UnFlatConfigEntryBase<
  ExtraPlugins,
  Pick<UnRulesConfigPartial<'e18e'>, `e18e/${(typeof RULE_CATEGORIES)[Category][number]}`>
>;

/**
 * An ESLint plugin from the [e18e community](https://e18e.dev) focusing on applying the e18e
 * community's best practices and advice to JavaScript/TypeScript codebases.
 *
 * 📁 Default `files`: ❌ none, sub configs are used instead
 */
export interface E18eEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never> {
  /**
   * "New syntax and APIs which improve code readability and performance" -
   * [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: all files
   * @default true
   */
  configModernization?: boolean | SubConfigOptions<ExtraPlugins, 'modernization'>;

  /**
   * "Community recommended alternatives to popular libraries, focused on performance and size" -
   * [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: <code>**&#47;package.json</code>
   * @default true
   */
  configModuleReplacements?:
    | boolean
    | (SubConfigOptions<ExtraPlugins, 'moduleReplacements'> & {
        /**
         * Options of the only rule in this sub-config, `e18e/ban-dependencies`,
         */
        options?: GetRuleOptions<'e18e', 'ban-dependencies'>;
      });

  /**
   * "Patterns that can be optimized for better runtime performance" -
   * [plugin docs](https://github.com/e18e/eslint-plugin#overview)
   *
   * 📁 Default `files`: all files
   *
   * 💭
   * @default true
   */
  configPerformanceImprovements?:
    boolean | SubConfigOptions<ExtraPlugins, 'performanceImprovements'>;
}

export default defineUnConfig<E18eEslintConfigOptions>('e18e', {enabledBy: {group: 'misc'}})((
  context,
  optionsRaw,
) => {
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
      ?.addConfig('e18e/modernization')
      .addRule('prefer-array-at', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-fill', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-to-reversed', ERROR) /** @since 0.0.1 */ // 💭?
      .addRule('prefer-array-to-sorted', ERROR) /** @since 0.0.1 */ // 💭?
      .addRule('prefer-array-to-spliced', ERROR) /** @since 0.0.1 */
      .addRule('prefer-exponentiation-operator', ERROR) /** @since 0.0.1 */
      .addRule('prefer-get-or-insert', OFF) /** @since 0.5.1 */ // 🔴
      .addRule('prefer-includes', ERROR) /** @since 0.0.1 */
      .addRule('prefer-nullish-coalescing', ERROR) /** @since 0.0.1 */
      .addRule('prefer-object-has-own', ERROR) /** @since 0.0.1 */
      .addRule('prefer-spread-syntax', ERROR) /** @since 0.0.1 */
      .addRule('prefer-url-canparse', ERROR) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore next */
        rulesToSkipInConfig: (ruleName) => !arrayIncludes(RULE_CATEGORIES.modernization, ruleName),
      })
      .addOverrides();
  }

  const configBuilderModuleReplacements = context.createConfigBuilder(
    configModuleReplacements,
    'e18e',
  );

  if (configModuleReplacements) {
    const configModuleReplacementsOptions = assignDefaults(configModuleReplacements, {});

    const {options: banDependenciesOptions} = configModuleReplacementsOptions;

    configBuilderModuleReplacements
      ?.addConfig([
        'e18e/module-replacements',
        {
          filesDefault: [GLOB_PACKAGE_JSON],
          parseWith: ['jsonc', 'json'],
        },
      ])
      .addRule(
        'ban-dependencies',
        ERROR,
        banDependenciesOptions ? [banDependenciesOptions] : [],
      ) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore start */
        rulesToSkipInConfig: (ruleName) =>
          !arrayIncludes(RULE_CATEGORIES.moduleReplacements, ruleName),
        /* v8 ignore stop */
      })
      .addOverrides();
  }

  const configBuilderPerformanceImprovements = context.createConfigBuilder(
    configPerformanceImprovements,
    'e18e',
  );

  if (configPerformanceImprovements) {
    configBuilderPerformanceImprovements
      ?.addConfig('e18e/performance-improvements')
      .addRule('no-delete-property', OFF) /** @since 0.5.0 */ // 🔴
      .addRule('no-indexof-equality', ERROR) /** @since 0.0.1 */ // 🔴💭
      .addRule('no-spread-in-reduce', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-array-from-map', ERROR) /** @since 0.0.1 */
      .addRule('prefer-array-some', ERROR) /** @since 0.1.4 */
      .addRule('prefer-charcode-at-in-loop', ERROR) /** @since 0.6.0 */ // 🔴💭
      .addRule('prefer-date-now', ERROR) /** @since 0.1.3 */
      .addRule('prefer-flatmap-over-map-flat', ERROR) /** @since 0.5.1 */ // 🔴
      .addRule('prefer-includes-over-regex-test', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-inline-equality', ERROR) /** @since 0.2.0 */ // 💭?
      .addRule('prefer-regex-test', ERROR) /** @since 0.1.3 */ // 💭?
      // Reason for disabling: equivalent operation not requiring an intermediate array either requires an intermediate variable instead, or a cryptic form: `haystack.slice(0, haystack.indexOf(needle) >>> 0)`
      .addRule('prefer-slice-over-split-index', OFF) /** @since 0.6.0 */ // 🔴
      .addRule('prefer-static-collator', ERROR) /** @since 0.5.0 */ // 🔴
      .addRule('prefer-static-regex', ERROR) /** @since 0.2.0 */
      .addRule('prefer-string-fromcharcode', ERROR) /** @since 0.5.0 */
      .addRule('prefer-throw-if-no-entry', ERROR) /** @since 0.6.0 */ // 🔴
      .addRule('prefer-timer-args', ERROR) /** @since 0.0.1 */
      .enableConfigTesterForPlugin('e18e', {
        /* v8 ignore start */
        rulesToSkipInConfig: (ruleName) =>
          !arrayIncludes(RULE_CATEGORIES.performanceImprovements, ruleName),
        /* v8 ignore stop */
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
});
