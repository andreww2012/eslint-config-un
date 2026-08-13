import type Eslint from 'eslint';
import type {ExtraPluginsType, UnConfigContext} from '../config-un/shared';
import {ERROR, OFF, type RuleSeverity, WARNING} from '../constants';
import {PLUGIN_PREFIXES_LIST, type PluginPrefix} from '../loaders';
import type {Nullable} from '../types';
import {cloneDeep} from '../utils';
import type {
  EslintFlatConfigEntry,
  EslintPlugin,
  EslintRuleEntry,
  EslintRuleMetaWithLanguages,
  EslintSeverity,
} from './eslint-types';

function disableRuleAutofix(rule: Eslint.Rule.RuleModule): Eslint.Rule.RuleModule {
  return {
    ...rule,
    create: (context: Eslint.Rule.RuleContext): Eslint.Rule.RuleListener => {
      const patchedContext = Object.create(context, {
        report: {
          enumerable: true,
          value: (descriptor: Eslint.Rule.ReportDescriptor): void => {
            delete (descriptor as {fix?: unknown}).fix;
            context.report(descriptor);
          },
        },
      }) as Eslint.Rule.RuleContext;
      return rule.create(patchedContext);
    },
  };
}

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

export const resolveFullRuleName = (
  context: UnConfigContext,
  pluginPrefix: PluginPrefix,
  ruleNameUnprefixed: string,
) => {
  const pluginPrefixResolved =
    context.rootOptions.pluginRenames?.[pluginPrefix as Exclude<PluginPrefix, ''>] || pluginPrefix;
  return pluginPrefixResolved
    ? `${pluginPrefixResolved}/${ruleNameUnprefixed}`
    : ruleNameUnprefixed;
};

export const eslintToUnRuleSeverity = (
  maybeEslintSeverity: EslintSeverity | undefined,
  defaultSeverity: RuleSeverity = OFF,
): RuleSeverity =>
  typeof maybeEslintSeverity === 'string'
    ? STRING_SEVERITY_TO_NUMERIC[maybeEslintSeverity]
    : ((maybeEslintSeverity ?? defaultSeverity) as RuleSeverity);

export const getRuleSeverityFromEslintRuleEntry = (
  entry: Nullable<EslintRuleEntry>,
): RuleSeverity => eslintToUnRuleSeverity(Array.isArray(entry) ? entry[0] : (entry ?? OFF));

const FLAT_CONFIG_UN_NAME_PREFIX = 'eslint-config-un/';
export const genFlatConfigEntryName = (name: string) => `${FLAT_CONFIG_UN_NAME_PREFIX}${name}`;
/* v8 ignore next - Every generated config is named */
export const isUnFlatConfigEntry = (flatConfigEntry: EslintFlatConfigEntry) =>
  (flatConfigEntry.name || '').startsWith(FLAT_CONFIG_UN_NAME_PREFIX);

export const removeRuleLanguagesFromPlugin = <Plugin extends EslintPlugin>(
  plugin: Plugin,
): Plugin => {
  const rulesWithLanguages = Object.entries(plugin.rules || {}).filter(
    ([, {meta}]) => meta != null && 'languages' in meta,
  );

  if (rulesWithLanguages.length === 0) {
    return plugin;
  }

  return {
    ...plugin,
    rules: {
      ...plugin.rules,
      ...Object.fromEntries(
        rulesWithLanguages.map(([ruleName, rule]) => {
          const meta: EslintRuleMetaWithLanguages = {...rule.meta};
          delete meta.languages;
          return [ruleName, {...rule, meta}];
        }),
      ),
    },
  };
};

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
    Object.entries(
      cloneDeep(
        /* v8 ignore next - A plugin whose autofixes are disabled always has rules */ plugin.rules ||
          {},
      ),
    )
      .map(([ruleId, ruleImplementation]): [string, Eslint.Rule.RuleModule] | null => {
        const fullRuleName = `${pluginNamespace ? `${pluginNamespace}/` : ''}${ruleId}`;
        const isFixable = ruleImplementation.meta?.fixable;
        if (
          includeRulesWithoutAutofix &&
          (!isFixable || invertOnlyRules === onlyRules?.includes(fullRuleName))
        ) {
          return [fullRuleName, ruleImplementation];
        }

        if (!isFixable && !includeRulesWithoutAutofix) {
          return null;
        }

        const ruleImplementationWithAutofixDisabled = disableRuleAutofix(ruleImplementation);
        delete ruleImplementationWithAutofixDisabled.meta?.fixable;
        return [fullRuleName, ruleImplementationWithAutofixDisabled];
      })
      .filter((v) => v != null),
  );
