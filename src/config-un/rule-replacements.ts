import {eslintPluginVanillaRules} from '../eslint/eslint-shared';
import type {
  EslintFullRuleName,
  EslintPlugin,
  GetRuleNamesInPlugin,
  UnAllRuleNames,
} from '../eslint/eslint-types';
import {
  type EslintPluginRule,
  getRuleNameAndPluginPrefixByFullName,
  prefixRuleName,
} from '../eslint/eslint-utils';
import {PLUGIN_PREFIXES_LIST, type PluginPrefix} from '../loaders';
import {BUILTIN_RULE_REPLACEMENTS} from '../plugins.gen';
import type {MaybePromise} from '../types';
import {
  arrayIncludes,
  arrayUnique,
  isKeyIn,
  mapValues,
  stylePluginPrefix,
  styleRuleName,
} from '../utils';
import {
  BUILTIN_RULE_REPLACEMENTS_DOCS_URL,
  type RuleReplacementToApply,
  describeRuleReplacement,
  withReplacedRules,
} from './replace-plugin-rules';
import type {RuleReplacement, RuleReplacementTraits} from './rule-replacement-types';
import {
  type RuleTraitsChange,
  getRuleTraitsChange,
  resolveRuleTraitTables,
} from './rule-trait-tables';
import type {PackageRequester, UnConfigContext} from './shared';

// #region 🟠 Replacement requests

/**
 * A request to replace a rule: the replacement, as a `replacements` option takes it, and what asks
 * for it
 */
interface RuleReplacementRequest {
  replacement: RuleReplacement<string>;
  requester?: PackageRequester;
}

/**
 * The requests for the rules of a single plugin, keyed by the rule name without the prefix
 */
export type RuleReplacementRequests = Partial<Record<string, RuleReplacementRequest>>;

/**
 * Turns the replacements of a `replacements` option into requests made by `requester`
 */
export const toReplacementRequests = (
  replacements: Partial<Record<string, RuleReplacement<string>>>,
  requester?: PackageRequester,
): RuleReplacementRequests =>
  Object.fromEntries(
    Object.entries(replacements).flatMap(([ruleName, replacement]) =>
      replacement == null ? [] : [[ruleName, {replacement, ...(requester && {requester})}]],
    ),
  );

/**
 * Returns what each rule of the plugin is asked to be replaced with.
 * The later sources win: the replacements that are on by default, the requests of other options,
 * then the plugin's own `replacements` option
 */
const readRuleReplacementRequests = (
  rootOptions: UnConfigContext['rootOptions'],
  pluginPrefix: PluginPrefix,
  requestsOfOtherOptions: RuleReplacementRequests | undefined,
): RuleReplacementRequests => {
  const {plugins = {}} = rootOptions;
  const pluginOptions = isKeyIn(pluginPrefix, plugins) ? plugins[pluginPrefix] : undefined;
  // eslint-disable-next-line un/no-type-assertion -- Typed `unknown` to keep the type check fast
  const replacements = pluginOptions?.replacements as
    | boolean
    | Partial<Record<string, RuleReplacement<string>>>
    | undefined;
  const areDefaultsApplied = replacements !== false && pluginOptions?.plugin == null;
  return {
    ...toReplacementRequests(
      mapValues(
        BUILTIN_RULE_REPLACEMENTS[pluginPrefix] || {},
        (replacement) => areDefaultsApplied && replacement?.isOnByDefault === true,
      ),
    ),
    ...(replacements !== false && requestsOfOtherOptions),
    ...(typeof replacements === 'object' && toReplacementRequests(replacements, 'option:plugins')),
  };
};

// #endregion

// #region 🟠 Replacement resolved

type RuleFactory = (original?: EslintPluginRule) => MaybePromise<EslintPluginRule>;

export interface RuleReplacementResolved {
  targetPrefix: PluginPrefix;
  targetRuleName: string;
  source: string | EslintPluginRule | RuleFactory;

  /**
   * The replacing rule, when it is given by name.
   * The prefix is the canonical one
   */
  sourceByName?: {pluginPrefix: string; ruleName: string};

  isBuiltin: boolean;
  dropOptionsSetByConfigs: boolean;
  traits?: RuleReplacementTraits;

  /**
   * Recorded as the reason to load the plugin of a replacing rule given by name
   */
  requester?: PackageRequester;
}

/**
 * Whether the source is a function that takes the original rule, like one wrapping it, and not one
 * that only loads another rule
 */
const isRuleWrapper = (source: RuleReplacementResolved['source']) =>
  typeof source === 'function' && source.length > 0;

const resolveRuleReplacement = (
  rootOptions: UnConfigContext['rootOptions'],
  pluginPrefix: PluginPrefix,
  ruleName: string,
  {replacement, requester}: RuleReplacementRequest,
): RuleReplacementResolved | null => {
  const builtinRule = BUILTIN_RULE_REPLACEMENTS[pluginPrefix]?.[ruleName]?.rule;
  const replacementAsObject =
    typeof replacement === 'boolean'
      ? replacement && builtinRule && {rule: builtinRule}
      : typeof replacement === 'object' && !('create' in replacement)
        ? replacement
        : {rule: replacement};
  if (!replacementAsObject) {
    return null;
  }

  const sourceByName =
    typeof replacementAsObject.rule === 'string'
      ? getRuleNameAndPluginPrefixByFullName({rootOptions}, replacementAsObject.rule)
      : null;
  return {
    targetPrefix: pluginPrefix,
    targetRuleName: ruleName,
    // eslint-disable-next-line un/no-type-assertion -- The option types accept a rule typed in any way, which can't be checked at runtime, so they are trusted
    source: replacementAsObject.rule as RuleReplacementResolved['source'],
    ...(sourceByName && {
      sourceByName: {
        pluginPrefix: sourceByName.pluginPrefixCanonical,
        ruleName: sourceByName.ruleNameUnprefixed,
      },
    }),
    isBuiltin: typeof replacement === 'boolean',
    dropOptionsSetByConfigs:
      'dropOptionsSetByConfigs' in replacementAsObject &&
      replacementAsObject.dropOptionsSetByConfigs === true,
    ...('traits' in replacementAsObject && {traits: replacementAsObject.traits}),
    ...(requester && {requester}),
  };
};

/**
 * Works out which rules are replaced by what, and the traits all the rules end up with.
 *
 * `requestsOfOtherOptions` are the replacements that options other than
 * `plugins.<pluginName>.replacements` ask for, keyed by the plugin prefix.
 * The user made them, so unlike the default ones they also apply to a plugin provided through
 * `plugins.<pluginName>.plugin`.
 *
 * Only reads the options, so the result is the same when the config is restored from the cache
 */
export const resolveRuleReplacements = (
  rootOptions: UnConfigContext['rootOptions'],
  requestsOfOtherOptions: Partial<Record<string, RuleReplacementRequests>> = {},
) => {
  const replacements = new Map<string, RuleReplacementResolved>();
  const traitsChanges: RuleTraitsChange[] = [];

  arrayUnique([
    ...Object.keys(BUILTIN_RULE_REPLACEMENTS),
    ...Object.keys(rootOptions.plugins || {}),
    ...Object.keys(requestsOfOtherOptions),
  ])
    .flatMap((pluginPrefix) =>
      pluginPrefix.length > 0 && arrayIncludes(PLUGIN_PREFIXES_LIST, pluginPrefix)
        ? pluginPrefix
        : [],
    )
    .forEach((pluginPrefix) => {
      Object.entries(
        readRuleReplacementRequests(
          rootOptions,
          pluginPrefix,
          requestsOfOtherOptions[pluginPrefix],
        ),
      ).forEach(([ruleName, replacementRequest]) => {
        const replacement = replacementRequest
          ? resolveRuleReplacement(rootOptions, pluginPrefix, ruleName, replacementRequest)
          : null;
        if (replacement) {
          replacements.set(prefixRuleName(pluginPrefix, ruleName), replacement);
        }

        const sourceByName = replacement ? replacement.sourceByName : undefined;
        const hasSourceKnownTraits =
          sourceByName != null && arrayIncludes(PLUGIN_PREFIXES_LIST, sourceByName.pluginPrefix);
        const traitsChange = getRuleTraitsChange(
          pluginPrefix,
          ruleName,
          // A rule given by the name of a built-in plugin rule takes its traits
          hasSourceKnownTraits ? sourceByName : {pluginPrefix, ruleName},
          // An autofix is disabled by default because of how a rule is implemented, so another
          // implementation doesn't keep that. A wrapper still runs the one it wraps
          replacement && !hasSourceKnownTraits && !isRuleWrapper(replacement.source)
            ? {autofixDisabled: false, ...replacement.traits}
            : replacement?.traits,
        );
        if (traitsChange) {
          traitsChanges.push(traitsChange);
        }
      });
    });

  return {
    replacements,
    ruleTraits: resolveRuleTraitTables(traitsChanges),
  };
};

// #endregion

// #region 🟠 Shared helpers

/**
 * Marks the plugins of the replacing rules given by name as used, so that they get loaded.
 * Only for the replaced rules whose own plugin `isPluginLoaded` says is going to be loaded
 */
export const registerRuleReplacementSources = (
  context: UnConfigContext,
  isPluginLoaded: (pluginPrefix: string) => boolean,
) => {
  context.ruleReplacements.forEach(({targetPrefix, sourceByName, requester}) => {
    if (sourceByName?.pluginPrefix && isPluginLoaded(targetPrefix)) {
      context.registerUsedPlugin(sourceByName.pluginPrefix, requester);
    }
  });
};

/**
 * Whether a rule of the plugin replaces another one
 */
export const isRuleReplacementSourcePlugin = (context: UnConfigContext, pluginPrefix: string) =>
  context.ruleReplacements
    .values()
    .some(({sourceByName}) => sourceByName?.pluginPrefix === pluginPrefix);

const resolveRuleGetter = async (
  {source, sourceByName, targetRuleName}: RuleReplacementResolved,
  plugin: EslintPlugin,
  pluginsOriginal: Partial<Record<string, EslintPlugin>>,
): Promise<RuleReplacementToApply['getRule'] | null> => {
  if (typeof source === 'object') {
    return () => source;
  }
  if (typeof source === 'function') {
    // Reading the original rule may load it, so only a wrapper gets it
    const rule = await (isRuleWrapper(source) ? source(plugin.rules?.[targetRuleName]) : source());
    return () => rule;
  }
  const sourceRules =
    sourceByName &&
    (sourceByName.pluginPrefix
      ? pluginsOriginal[sourceByName.pluginPrefix]
      : eslintPluginVanillaRules
    )?.rules;
  return sourceRules && sourceByName.ruleName in sourceRules
    ? () => sourceRules[sourceByName.ruleName]
    : null;
};

/**
 * Returns the loaded plugins with the replacing rules put in place of the replaced ones.
 * Must run before anything else wraps the rules, like the autofix removal, so that the replacing
 * rules are what gets wrapped
 */
export const withRuleReplacements = async <Plugins extends Partial<Record<string, EslintPlugin>>>(
  context: UnConfigContext,
  plugins: Plugins,
): Promise<Plugins> => {
  const replacementsPerPlugin = Map.groupBy(
    [...context.ruleReplacements.values()].filter(
      ({targetPrefix}) => plugins[targetPrefix] != null,
    ),
    ({targetPrefix}) => targetPrefix,
  );

  const patchedPlugins = await Promise.all(
    Array.from(replacementsPerPlugin, async ([pluginPrefix, pluginReplacements]) => {
      const plugin = plugins[pluginPrefix];
      /* v8 ignore next Only the loaded plugins are grouped */
      if (!plugin) {
        return null;
      }

      const rulesToApply = (
        await Promise.all(
          pluginReplacements.map(async (replacement) => {
            const getRule = await resolveRuleGetter(replacement, plugin, plugins);
            const {targetRuleName, source, isBuiltin} = replacement;
            return (
              getRule && {
                ruleName: targetRuleName,
                ...(typeof source === 'string' && {sourceName: source}),
                getRule,
                ...(isBuiltin && {docsUrl: BUILTIN_RULE_REPLACEMENTS_DOCS_URL}),
              }
            );
          }),
        )
      ).filter((value) => value != null);

      if (rulesToApply.length === 0) {
        return null;
      }

      context.debug(
        `Replaced the implementations of the following ${stylePluginPrefix(pluginPrefix)} plugin rules: ${rulesToApply.map((rule) => styleRuleName(describeRuleReplacement(rule))).join(', ')}`,
      );

      return [pluginPrefix, withReplacedRules(plugin, rulesToApply)] as const;
    }),
  );

  return {
    ...plugins,
    ...Object.fromEntries(patchedPlugins.filter((value) => value != null)),
  };
};

/**
 * Whether our Configs leave out the options they pass to the rule
 */
export const shouldDropOptionsSetByConfigs = (
  context: UnConfigContext,
  pluginPrefix: PluginPrefix,
  ruleName: string,
) =>
  context.ruleReplacements.get(prefixRuleName(pluginPrefix, ruleName))?.dropOptionsSetByConfigs ===
  true;

// #endregion

// #region 🟠 Public exports

/**
 * Returns the given `plugins.<pluginName>.replacements` value of a plugin as it is, type checked.
 *
 * Needed when the value has a function with an untyped parameter, like a wrapper of the original
 * rule: written right in `eslintConfig()`, such a function is reported, and here its parameter
 * gets a type.
 *
 * The rule names are checked again once the result is passed to `eslintConfig()`
 * @example
 * defineRuleReplacements('unicorn', {'no-null': (original) => ({...original})})
 */
export const defineRuleReplacements = <
  const Plugin extends Exclude<PluginPrefix, ''>,
  const Replacements extends Partial<
    Record<
      GetRuleNamesInPlugin<Plugin>,
      RuleReplacement<UnAllRuleNames | (EslintFullRuleName & {})>
    >
  >,
>(
  _plugin: Plugin,
  replacements: Replacements,
) => replacements;

// #endregion
