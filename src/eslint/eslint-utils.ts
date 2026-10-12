import type * as Eslint from 'eslint';
import type {ExtraPluginsType, UnConfigContext} from '../config-un/shared';
import {ERROR, OFF, type RuleSeverity, WARNING} from '../constants';
import {PLUGIN_PREFIXES_LIST, type PluginPrefix} from '../loaders';
import type {Nullable} from '../types';
import {arrayIncludes, cloneDeep, isKeyIn} from '../utils';
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
            Reflect.deleteProperty(descriptor, 'fix');
            context.report(descriptor);
          },
        },
      }) as Eslint.Rule.RuleContext; // eslint-disable-line un/no-type-assertion -- only `report` is replaced
      return rule.create(patchedContext);
    },
  };
}

const ESLINT_TO_UN_SEVERITY: Readonly<Record<EslintSeverity, RuleSeverity>> = {
  off: OFF,
  0: OFF,
  warn: WARNING,
  1: WARNING,
  error: ERROR,
  2: ERROR,
};

export const getRuleUnSeverityAndOptionsFromEntry = <Options extends unknown[]>(
  entry: Eslint.Linter.RuleEntry<Options>,
  severityOrOptionsOverride?: [RuleSeverity?, Options?],
): [severity: RuleSeverity, options: Options | []] => {
  const severityRaw = Array.isArray(entry) ? entry[0] : entry;
  const severity = severityOrOptionsOverride?.[0] ?? ESLINT_TO_UN_SEVERITY[severityRaw];
  return [
    severity,
    severityOrOptionsOverride?.[1] ||
      (Array.isArray(entry)
        ? // eslint-disable-next-line un/no-type-assertion -- ESLint types the options as partial, as they may be omitted
          structuredClone(entry.slice(1) as Options)
        : []),
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
      (arrayIncludes(PLUGIN_PREFIXES_LIST, possiblePrefix) ||
        (context.rootOptions.extraPlugins && possiblePrefix in context.rootOptions.extraPlugins))
    ) {
      return possiblePrefix;
    }
  }
  return '';
};

export const resolvePluginPrefix = (
  context: UnConfigContext,
  pluginPrefix: PluginPrefix | (string & {}),
) => {
  const {plugins} = context.rootOptions;
  return (
    (plugins && isKeyIn(pluginPrefix, plugins) && plugins[pluginPrefix]?.prefix) || pluginPrefix
  );
};

export const getRuleNameAndPluginPrefixByFullName = (
  context: UnConfigContext,
  fullRuleName: string,
) => {
  const pluginPrefixCanonical = getPluginPrefixByFullRuleName(context, fullRuleName);
  const pluginPrefixResolved = resolvePluginPrefix(context, pluginPrefixCanonical);
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
  const pluginPrefixResolved = resolvePluginPrefix(context, pluginPrefix);
  return pluginPrefixResolved
    ? `${pluginPrefixResolved}/${ruleNameUnprefixed}`
    : ruleNameUnprefixed;
};

export const eslintToUnRuleSeverity = (
  maybeEslintSeverity: EslintSeverity | undefined,
  defaultSeverity: RuleSeverity = OFF,
): RuleSeverity =>
  maybeEslintSeverity == null ? defaultSeverity : ESLINT_TO_UN_SEVERITY[maybeEslintSeverity];

export const getRuleSeverityFromEslintRuleEntry = (
  entry: Nullable<EslintRuleEntry>,
): RuleSeverity => eslintToUnRuleSeverity(Array.isArray(entry) ? entry[0] : (entry ?? OFF));

const FLAT_CONFIG_UN_NAME_PREFIX = 'eslint-config-un/';
export const genFlatConfigEntryName = (name: string, {isGlobalSetup = false} = {}) =>
  `${FLAT_CONFIG_UN_NAME_PREFIX}${isGlobalSetup ? 'global-setup/' : ''}${name}`;
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
        const isFixable = Boolean(ruleImplementation.meta?.fixable);
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
