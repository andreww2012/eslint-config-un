import type Eslint from 'eslint';
// @ts-expect-error no typings
import ruleComposer from 'eslint-rule-composer';
import type {ExtraPluginsType, UnConfigContext} from '../config-un/shared';
import {ERROR, OFF, type RuleSeverity, WARNING} from '../constants';
import {PLUGIN_PREFIXES_LIST, type PluginPrefix} from '../loaders';
import {cloneDeep} from '../utils';
import type {EslintFlatConfigEntry, EslintPlugin, EslintSeverity} from './eslint-types';

const STRING_SEVERITY_TO_NUMERIC: Record<EslintSeverity & string, RuleSeverity> = {
  off: OFF,
  warn: WARNING,
  error: ERROR,
};

export const getRuleUnSeverityAndOptionsFromEntry = <Options extends unknown[]>(
  entry: Eslint.Linter.RuleEntry<Options>,
  severityOrOptionsOverride?: [RuleSeverity?, Options?],
): [severity: RuleSeverity, options: Options | []] => {
  const severityRaw = Array.isArray(entry) ? entry[0] : entry;
  const severity =
    severityOrOptionsOverride?.[0] ??
    ((typeof severityRaw === 'string'
      ? STRING_SEVERITY_TO_NUMERIC[severityRaw]
      : severityRaw) as RuleSeverity);
  return [
    severity,
    severityOrOptionsOverride?.[1] ??
      (Array.isArray(entry) ? structuredClone(entry.slice(1) as Options) : []),
  ];
};

const getPluginPrefixByFullRuleName = <ExtraPlugins extends ExtraPluginsType>(
  context: UnConfigContext<ExtraPlugins>,
  ruleName: string,
): PluginPrefix | keyof ExtraPlugins => {
  const ruleNameSplitted = ruleName.split('/');
  if (ruleNameSplitted.length === 1) {
    return '';
  }
  for (let i = 0; i < ruleNameSplitted.length; i++) {
    const possiblePrefix = ruleNameSplitted.slice(0, ruleNameSplitted.length - i - 1).join('/');
    if (
      possiblePrefix &&
      (PLUGIN_PREFIXES_LIST.includes(possiblePrefix as PluginPrefix) ||
        (context.rootOptions.extraPlugins && possiblePrefix in context.rootOptions.extraPlugins))
    ) {
      return possiblePrefix;
    }
  }
  return '';
};

export const getRuleNameAndPluginPrefixByFullName = (
  context: UnConfigContext,
  fullRuleName: string,
) => {
  const pluginRenames = context.rootOptions.pluginRenames || {};

  const pluginPrefixCanonical = getPluginPrefixByFullRuleName(context, fullRuleName);
  const pluginPrefixResolved =
    pluginPrefixCanonical && pluginPrefixCanonical in pluginRenames
      ? pluginRenames[pluginPrefixCanonical as Exclude<PluginPrefix, ''>] || pluginPrefixCanonical
      : pluginPrefixCanonical;
  const ruleNameUnprefixed = pluginPrefixCanonical
    ? fullRuleName.slice(pluginPrefixCanonical.length + 1 /* `/` character */)
    : fullRuleName;
  const fullRuleNameWithResolvedPrefix =
    pluginPrefixCanonical && pluginPrefixResolved
      ? `${pluginPrefixResolved}/${ruleNameUnprefixed}`
      : fullRuleName;

  return {
    pluginPrefixCanonical,
    pluginPrefixResolved,
    ruleNameUnprefixed,
    fullRuleNameWithResolvedPrefix,
  };
};

export const eslintToUnRuleSeverity = (
  maybeEslintSeverity: EslintSeverity | undefined,
  defaultSeverity: RuleSeverity = OFF,
): RuleSeverity =>
  typeof maybeEslintSeverity === 'string'
    ? STRING_SEVERITY_TO_NUMERIC[maybeEslintSeverity]
    : maybeEslintSeverity == null
      ? defaultSeverity
      : (maybeEslintSeverity as RuleSeverity);

const FLAT_CONFIG_UN_NAME_PREFIX = 'eslint-config-un/';
export const genFlatConfigEntryName = (name: string) => `${FLAT_CONFIG_UN_NAME_PREFIX}${name}`;
export const isUnFlatConfigEntry = (flatConfigEntry: EslintFlatConfigEntry) =>
  (flatConfigEntry.name || '').startsWith(FLAT_CONFIG_UN_NAME_PREFIX);

export const disableAutofixForAllRulesInPlugin = <Plugin extends EslintPlugin>(
  pluginNamespace: string,
  plugin: Plugin,
  {
    includeRulesWithoutAutofix,
    onlyRules,
    invertOnlyRules = false,
  }: {includeRulesWithoutAutofix?: boolean; onlyRules?: string[]; invertOnlyRules?: boolean} = {},
): Plugin['rules'] & {} =>
  Object.fromEntries(
    Object.entries(cloneDeep(plugin.rules || {}))
      .map(([ruleId, ruleImplementation]) => {
        const fullRuleName = `${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`;
        const isFixable = ruleImplementation.meta?.fixable;
        if (
          includeRulesWithoutAutofix &&
          (!isFixable || invertOnlyRules === onlyRules?.includes(fullRuleName))
        ) {
          return [fullRuleName, ruleImplementation] as const;
        }
        if (!isFixable && !includeRulesWithoutAutofix) {
          return null;
        }
        // eslint-disable-next-line ts/no-unsafe-call, ts/no-unsafe-member-access
        const ruleImplementationWithAutofixDisabled = ruleComposer.mapReports(
          ruleImplementation,
          // eslint-disable-next-line ts/no-explicit-any
          (problem: any) => {
            // eslint-disable-next-line ts/no-unsafe-member-access
            delete problem.fix;
            // eslint-disable-next-line ts/no-unsafe-return
            return problem;
          },
        ) as typeof ruleImplementation;
        delete ruleImplementationWithAutofixDisabled.meta?.fixable;
        return [fullRuleName, ruleImplementationWithAutofixDisabled] as const;
      })
      .filter((v) => v != null),
  );
