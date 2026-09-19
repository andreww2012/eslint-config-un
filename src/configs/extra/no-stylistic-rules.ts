// cspell:ignore attributify blockquotes autolinks setext
import type {UnExtraPluginsRules} from '../../eslint/eslint-types';
import {ALL_RULES_PER_PLUGIN} from '../../eslint-rules.gen';
import {ALL_STYLISTIC_RULES, type AllStylisticRules} from '../../plugins.gen';
import {isKeyIn, objectEntriesUnsafe} from '../../utils';
import {
  type ExtraPluginsType,
  type UnAllRuleNames,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

const STYLISTIC_RULES_PER_PLUGIN: Partial<Record<string, Partial<Record<string, true>>>> =
  ALL_STYLISTIC_RULES;

/* eslint-disable perfectionist/sort-objects */

/**
 * If you integrate eslint-config-un into an existing project, you might encounter a lot of reports
 * from rules that are merely about stylistic and other choices, not the ones that can potentially
 * find bugs and other kinds of problems in your code.
 * Use this config to globally disable all such rules, or conversely enable only them, or some of
 * them.
 *
 * 📁 Default `files`: all files
 */
export interface NoStylisticRulesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {
  /**
   * Enables some of the stylistic rules back instead of disabling all of them
   */
  enableRules?: {
    /**
     * Specify which of the disabled by default stylistic rules will be enabled.
     * `true` enables all rules.
     * In combination with `enableRules.disableAllOtherRules` set to `true`, all the other rules
     * will be disabled.
     * This allows you to enable stylistic rules exclusively.
     * @default false
     */
    rules: boolean | Partial<Record<AllStylisticRules, boolean>>;

    /**
     * Disable all other rules from all plugins except the ones specified in `enableRules.rules`.
     * @default false
     */
    disableAllOtherRules?: boolean;
  };

  /**
   * Specify arbitrary rules which should be considered stylistic.
   */
  additionalRules?: Partial<
    Record<Exclude<UnExtraPluginsRules<ExtraPlugins> | UnAllRuleNames, AllStylisticRules>, boolean>
  >;
}

export default defineUnConfig<NoStylisticRulesEslintConfigOptions>('noStylisticRules', {
  enabledBy: false,
  phase: 'terminal',
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {
    enableRules: {disableAllOtherRules = false, rules: enabledRules} = {rules: false},
    additionalRules,
  } = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig([
      'no-stylistic-rules',
      {
        ignoresInternal: false,
      },
    ])
    .disableBulkRules(
      enabledRules !== true &&
        [
          ...Object.entries(ALL_STYLISTIC_RULES).flatMap(([pluginName, rules]) =>
            Object.keys(rules).map((ruleName) => {
              const ruleNameWithPrefix = `${pluginName ? `${pluginName}/` : ''}${ruleName}`;
              return enabledRules && enabledRules[ruleNameWithPrefix as keyof typeof enabledRules]
                ? null
                : ruleNameWithPrefix;
            }),
          ),
          ...objectEntriesUnsafe(
            // eslint-disable-next-line ts/no-non-null-assertion, ts/no-unnecessary-condition -- added to preserve the type
            additionalRules! || {},
          ).map(([ruleName, isStylistic]) => (isStylistic ? ruleName : null)),
        ].filter((v) => v != null),
    )
    .addOverrides();

  if (disableAllOtherRules) {
    configBuilder
      ?.addConfig([
        'no-stylistic-rules/disable-all-non-stylistic-rules',
        {
          ignoresInternal: false,
        },
      ])
      .disableBulkRules(
        objectEntriesUnsafe(ALL_RULES_PER_PLUGIN)
          .flatMap(([pluginName, rules]) =>
            rules.map((ruleName) => {
              const ruleNameWithPluginPrefix = `${pluginName ? `${pluginName}/` : ''}${ruleName}`;
              return ruleName in (STYLISTIC_RULES_PER_PLUGIN[pluginName] || {}) &&
                !(
                  additionalRules &&
                  isKeyIn(ruleNameWithPluginPrefix, additionalRules) &&
                  additionalRules[ruleNameWithPluginPrefix] === true
                )
                ? null
                : ruleNameWithPluginPrefix;
            }),
          )
          .filter((v) => v != null),
      );
  }
});

/* eslint-enable perfectionist/sort-objects */
