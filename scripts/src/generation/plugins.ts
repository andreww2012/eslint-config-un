import fs from 'node:fs/promises';
import pathe from 'pathe';
import {invariant, keyedBy, mapEntries, mapValues} from 'utilery';
import {prefixRuleName} from '../../../src/eslint/eslint-utils';
import {RULE_CATEGORIES_PER_PLUGIN} from '../../../src/eslint-rule-categories.gen';
import {ALL_RULES_PER_PLUGIN} from '../../../src/eslint-rules.gen';
import {FIXABLE_RULES_PER_PLUGIN} from '../../../src/eslint-types-fixable-only.gen';
import {pluginsLoaders} from '../../../src/loaders/plugins';
import {
  type MaybeWithReason,
  type PluginMetadata,
  RULE_TRAITS_ORDERED,
  type RuleTrait,
  type RuleTraits,
} from '../../../src/plugins/shared';
import {stylePluginPrefix, styleRuleName, styleText} from '../../../src/utils';
import {
  type DiscoveredPlugin,
  collectRuleReplacements,
  collectRuleReplacementsOnByDefault,
  getRuleDocsUrl,
  readPluginMetadata,
} from '../../shared/plugin-metadata';

const ROOT_DIRECTORY = pathe.join(import.meta.dirname, '../../..');

const styleTrait = (trait: RuleTrait) => styleText('cyan', trait);
const styleFileName = (fileName: string) => styleText('yellow', fileName);

const RULE_NAMES_PER_PLUGIN: Readonly<Partial<Record<string, readonly string[]>>> =
  ALL_RULES_PER_PLUGIN;

const PLUGIN_LOADERS: Readonly<Partial<Record<string, {packageName: string}>>> = pluginsLoaders;

/**
 * The plugins whose rules declare the requirement themselves.
 * Listing a rule by hand there is an override, and only allowed when it says something the plugin
 * does not
 */
const TYPE_AWARE_CATEGORIES: Readonly<Partial<Record<string, readonly string[]>>> = mapEntries(
  RULE_CATEGORIES_PER_PLUGIN,
  (prefix, categories) => ('typeAware' in categories ? [prefix, categories.typeAware] : undefined),
);

interface TraitEntry {
  value: boolean | string;
  reason: string | null;
}

/**
 * Collapses the terse and the annotated notations into the same pair
 */
const readTrait = (traits: RuleTraits, trait: RuleTrait): TraitEntry | null => {
  const entry: MaybeWithReason<boolean | string> | undefined = traits[trait];
  if (entry == null) {
    return null;
  }
  return typeof entry === 'object'
    ? {value: entry[0], reason: entry[1]}
    : {value: entry, reason: null};
};

const ruleEntries = ({prefix, metadata}: DiscoveredPlugin) =>
  Object.entries(metadata.rules).map(([ruleName, traits]) => ({
    ruleName,
    fullRuleName: prefixRuleName(prefix, ruleName),
    traits,
  }));

const validate = (plugins: readonly DiscoveredPlugin[]) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const declaredPrefixes: ReadonlySet<string> = new Set(plugins.map(({prefix}) => prefix));
  Object.keys(pluginsLoaders)
    .filter((prefix) => !declaredPrefixes.has(prefix))
    .forEach((prefix) => {
      errors.push(`${stylePluginPrefix(prefix)} is loadable, but has no metadata file`);
    });

  plugins.forEach((plugin) => {
    const {prefix, fileName, metadata} = plugin;

    const expectedFileName = `${prefix || '@'}.ts`;
    if (fileName !== expectedFileName) {
      errors.push(
        `${styleFileName(fileName)} declares the ${stylePluginPrefix(prefix)} prefix, so it must be named ${styleFileName(expectedFileName)}`,
      );
    }

    if (prefix.length === 0) {
      if (metadata.configs != null) {
        errors.push('the pseudo-plugin holding the rules of ESLint itself serves no Config');
      }
    } else {
      if (!PLUGIN_LOADERS[prefix]) {
        errors.push(
          `${stylePluginPrefix(prefix)} has no loader, so its package name cannot be resolved`,
        );
      }
      // An empty list is a valid answer, an absent one means the question was never asked
      if (metadata.configs == null) {
        errors.push(`${stylePluginPrefix(prefix)} does not say which Configs it serves`);
      }
    }

    const knownRuleNames = new Set(RULE_NAMES_PER_PLUGIN[prefix] || []);

    const typeAwareRuleNames = TYPE_AWARE_CATEGORIES[prefix];
    if (typeAwareRuleNames) {
      const reportedByThePlugin = new Set(typeAwareRuleNames);
      ruleEntries(plugin).forEach(({ruleName, fullRuleName, traits}) => {
        const entry = readTrait(traits, 'requiresTypeInfo');
        if (entry?.value === true && reportedByThePlugin.has(ruleName)) {
          errors.push(
            `${styleRuleName(fullRuleName)} repeats the ${styleTrait('requiresTypeInfo')} value the plugin reports itself: only write it by hand to say something different`,
          );
        }
      });
    }

    ruleEntries(plugin).forEach(({ruleName, fullRuleName, traits}) => {
      if (!knownRuleNames.has(ruleName)) {
        errors.push(`${styleRuleName(fullRuleName)} is not a rule of the plugin (anymore)`);
        return;
      }

      RULE_TRAITS_ORDERED.forEach((trait) => {
        const entry = readTrait(traits, trait);
        if (!entry) {
          return;
        }
        if (entry.value === false && !entry.reason?.trim()) {
          errors.push(
            `${styleRuleName(fullRuleName)} rejects ${styleTrait(trait)} without saying why`,
          );
        }
        if (entry.reason?.startsWith('TODO')) {
          warnings.push(
            `${styleRuleName(fullRuleName)}: ${styleTrait(trait)} reason is still a TODO`,
          );
        }
      });

      const typeInfo = readTrait(traits, 'requiresTypeInfo');
      const throwsWithoutTypeInfo = typeInfo
        ? typeInfo.value === true
        : typeAwareRuleNames?.includes(ruleName);
      if (throwsWithoutTypeInfo && readTrait(traits, 'disableInCodeBlocks')?.value) {
        errors.push(
          `${styleRuleName(fullRuleName)} throws without type information, so it is disabled in code blocks already: drop its ${styleTrait('disableInCodeBlocks')} entry`,
        );
      }

      const autofixDisabled = readTrait(traits, 'autofixDisabled');
      if (autofixDisabled?.value !== true) {
        return;
      }

      if (!FIXABLE_RULES_PER_PLUGIN[prefix]?.[ruleName]) {
        errors.push(`${styleRuleName(fullRuleName)} disables autofix, but the rule is not fixable`);
      }
      if (!autofixDisabled.reason) {
        warnings.push(`${styleRuleName(fullRuleName)} disables autofix without saying why`);
      }
    });
  });

  const replacements = collectRuleReplacements(plugins);
  const replacedRuleNames: ReadonlySet<string> = new Set(replacements.map(({target}) => target));
  replacements.forEach(({targetPrefix, target, source, sourcePrefix, sourceRuleName}) => {
    if (targetPrefix.length === 0) {
      errors.push(`${styleRuleName(target)} is a rule of ESLint itself, which cannot be replaced`);
    }
    if (sourcePrefix == null || !RULE_NAMES_PER_PLUGIN[sourcePrefix]?.includes(sourceRuleName)) {
      errors.push(
        `${styleRuleName(target)} is replaced by ${styleRuleName(source)}, which is not a rule of any plugin`,
      );
    }
    if (replacedRuleNames.has(source)) {
      errors.push(
        `${styleRuleName(target)} is replaced by ${styleRuleName(source)}, which is replaced itself`,
      );
    }
  });

  return {errors, warnings};
};

/**
 * Expands the plugins declaring every one of their rules stylistic
 */
const withAllStylisticRules = (plugins: readonly DiscoveredPlugin[], rules: CollectedRules) => [
  ...rules,
  ...plugins.flatMap(({prefix, metadata}) =>
    metadata.allRulesStylistic
      ? (RULE_NAMES_PER_PLUGIN[prefix] || []).map((ruleName) => ({
          prefix,
          ruleName,
          fullRuleName: prefixRuleName(prefix, ruleName),
          value: true,
        }))
      : [],
  ),
];

/**
 * Every rule carrying the trait, with the rejections left out
 */
const collectTrait = (
  plugins: readonly DiscoveredPlugin[],
  trait: RuleTrait,
  {includeRejections = false} = {},
) =>
  plugins.flatMap((plugin) =>
    ruleEntries(plugin).flatMap(({ruleName, fullRuleName, traits}) => {
      const entry = readTrait(traits, trait);
      return entry == null || (!includeRejections && entry.value === false)
        ? []
        : {prefix: plugin.prefix, ruleName, fullRuleName, value: entry.value};
    }),
  );

type CollectedRules = ReturnType<typeof collectTrait>;

const renderFlatList = (ruleNames: readonly string[]) =>
  ruleNames.map((ruleName) => `  '${ruleName}',`).join('\n');

const renderUnion = (ruleNames: readonly string[]) =>
  ruleNames.length === 0 ? 'never' : ruleNames.map((ruleName) => `\n  | '${ruleName}'`).join('');

const renderPerPlugin = (rules: CollectedRules, renderValue: (value: boolean | string) => string) =>
  Array.from(
    Map.groupBy(rules, ({prefix}) => prefix),
    ([prefix, pluginRules]) => {
      const renderedRules = pluginRules
        .map(({ruleName, value}) => `    '${ruleName}': ${renderValue(value)},`)
        .join('\n');
      return `  '${prefix}': {\n${renderedRules}\n  },`;
    },
  ).join('\n');

/**
 * Adds what the plugin reports itself, minus the rules a hand-written entry already speaks for
 */
const withTypeAwareCategories = (plugins: readonly DiscoveredPlugin[], rules: CollectedRules) => {
  // The plugin only says that type information is used, never whether the rule survives without it
  const writtenByHand = new Set(
    collectTrait(plugins, 'requiresTypeInfo', {includeRejections: true}).map(
      ({fullRuleName}) => fullRuleName,
    ),
  );

  return [
    ...rules,
    ...plugins.flatMap(({prefix}) =>
      (TYPE_AWARE_CATEGORIES[prefix] || []).flatMap((ruleName) =>
        writtenByHand.has(prefixRuleName(prefix, ruleName))
          ? []
          : {
              prefix,
              ruleName,
              fullRuleName: prefixRuleName(prefix, ruleName),
              value: true,
            },
      ),
    ),
  ];
};

/**
 * Adds the rules that throw without type information, unless an explicit `false` keeps one enabled
 */
const withRulesThrowingWithoutTypeInfo = (
  plugins: readonly DiscoveredPlugin[],
  codeBlocks: CollectedRules,
  typeInfo: CollectedRules,
) => {
  const keptEnabled = new Set(
    collectTrait(plugins, 'disableInCodeBlocks', {includeRejections: true}).flatMap(
      ({fullRuleName, value}) => (value === false ? fullRuleName : []),
    ),
  );
  const listed = new Set(codeBlocks.map(({fullRuleName}) => fullRuleName));
  const pluginIndexes = new Map(plugins.map(({prefix}, index) => [prefix, index]));

  // Code blocks never get type information
  return [
    ...codeBlocks,
    ...typeInfo.filter(
      ({fullRuleName, value}) =>
        value === true && !listed.has(fullRuleName) && !keptEnabled.has(fullRuleName),
    ),
  ].sort(
    (left, right) =>
      (pluginIndexes.get(left.prefix) || 0) - (pluginIndexes.get(right.prefix) || 0) ||
      left.ruleName.localeCompare(right.ruleName),
  );
};

const TYPE_INFO_EXTRA_KEYS: readonly (keyof NonNullable<PluginMetadata['typeInfo']>)[] = [
  'extraPatterns',
  'extraFileExtensions',
];

const renderTypeInfo = (plugins: readonly DiscoveredPlugin[], rules: CollectedRules) =>
  Array.from(
    Map.groupBy(rules, ({prefix}) => prefix),
    ([prefix, pluginRules]) => {
      const extra = plugins.find((plugin) => plugin.prefix === prefix)?.metadata.typeInfo;
      pluginRules.sort((left, right) => left.ruleName.localeCompare(right.ruleName));
      return [
        `  '${prefix}': {`,
        '    rules: {',
        ...pluginRules.map(({ruleName, value}) => `      '${ruleName}': ${JSON.stringify(value)},`),
        '    },',
        ...TYPE_INFO_EXTRA_KEYS.flatMap((key) =>
          extra?.[key] ? `    ${key}: ${JSON.stringify(extra[key])},` : [],
        ),
        '  },',
      ].join('\n');
    },
  ).join('\n');

const fullRuleNames = (rules: CollectedRules) => rules.map(({fullRuleName}) => fullRuleName);

const renderPrettierLanguages = (plugins: readonly DiscoveredPlugin[]) =>
  Array.from(
    Map.groupBy(
      plugins.filter(({metadata}) => metadata.prettierLanguage != null),
      ({metadata}) => metadata.prettierLanguage,
    ),
    ([language, languagePlugins]) =>
      `  '${language}': [${languagePlugins.map(({prefix}) => `'${prefix}'`).join(', ')}],`,
  )
    .sort()
    .join('\n');

type Replacements = ReturnType<typeof collectRuleReplacements>;

/**
 * Returns the collected rules as they are by default: a rule replaced by default is listed with
 * the traits of the rule replacing it, not with its own
 */
const withDefaultReplacements = (rules: CollectedRules, replacements: Replacements) => {
  const replacedRuleNames: ReadonlySet<string> = new Set(replacements.map(({target}) => target));
  return [
    ...rules.filter(({fullRuleName}) => !replacedRuleNames.has(fullRuleName)),
    ...replacements.flatMap(({targetPrefix, targetRuleName, target, source}) =>
      rules
        .filter(({fullRuleName}) => fullRuleName === source)
        .map((rule) => ({
          ...rule,
          prefix: targetPrefix,
          ruleName: targetRuleName,
          fullRuleName: target,
        })),
    ),
  ];
};

/**
 * Returns the traits the tables list a rule with.
 * `disableInCodeBlocks` is `true` there, without the reason
 */
const readTraitValues = (fullRuleName: string, tables: Record<RuleTrait, CollectedRules>) =>
  Object.fromEntries(
    Object.entries(tables).flatMap(([trait, rules]) => {
      const rule = rules.find((candidate) => candidate.fullRuleName === fullRuleName);
      return rule ? [[trait, trait === 'disableInCodeBlocks' || rule.value]] : [];
    }),
  );

const renderReplacements = (
  replacements: Replacements,
  tablesWithoutReplacements: Record<RuleTrait, CollectedRules>,
) =>
  Array.from(
    Map.groupBy(replacements, ({targetPrefix}) => targetPrefix),
    ([prefix, pluginReplacements]) => {
      const renderedRules = pluginReplacements
        .map(({targetRuleName, target, source, isOnByDefault}) => {
          const originalTraits =
            isOnByDefault && JSON.stringify(readTraitValues(target, tablesWithoutReplacements));
          return `    '${targetRuleName}': {rule: '${source}', isOnByDefault: ${String(isOnByDefault)}${originalTraits ? `, originalTraits: ${originalTraits}` : ''}},`;
        })
        .join('\n');
      return `  '${prefix}': {\n${renderedRules}\n  },`;
    },
  ).join('\n');

const renderArtifacts = (plugins: readonly DiscoveredPlugin[]) => {
  const typeInfoAuthored = withTypeAwareCategories(
    plugins,
    collectTrait(plugins, 'requiresTypeInfo'),
  );
  const tablesWithoutReplacements: Record<RuleTrait, CollectedRules> = {
    requiresTypeInfo: typeInfoAuthored,
    requiresNetwork: collectTrait(plugins, 'requiresNetwork'),
    stylistic: withAllStylisticRules(plugins, collectTrait(plugins, 'stylistic')),
    prettierIncompatible: collectTrait(plugins, 'prettierIncompatible'),
    autofixDisabled: collectTrait(plugins, 'autofixDisabled'),
    disableInCodeBlocks: withRulesThrowingWithoutTypeInfo(
      plugins,
      collectTrait(plugins, 'disableInCodeBlocks'),
      typeInfoAuthored,
    ),
    disableInTestFiles: collectTrait(plugins, 'disableInTestFiles'),
    cliFiles: collectTrait(plugins, 'cliFiles'),
  };

  const replacements = collectRuleReplacements(plugins);
  const defaultReplacements = collectRuleReplacementsOnByDefault(plugins);
  const tables = mapValues(tablesWithoutReplacements, (rules) =>
    withDefaultReplacements(rules, defaultReplacements),
  );
  // A rejected rule stays configurable through the config's own options, so it stays in the union
  const prettierMentioned = withDefaultReplacements(
    collectTrait(plugins, 'prettierIncompatible', {includeRejections: true}),
    defaultReplacements,
  );

  // The table of a trait is declared with the shape it has, and not `as const`: the type of each
  // table also describes it after the rule replacements of the user changed it
  return `import type {BuiltinRuleReplacement, RulesPerPlugin, TypeInfoRequirement} from './plugins/shared';

export const RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS: readonly string[] = [
${renderFlatList(fullRuleNames(tables.disableInCodeBlocks))}
];

export type RulesDisabledInEmbeddedCodeBlocksByDefault =${renderUnion(fullRuleNames(tables.disableInCodeBlocks))};

export const RULES_TO_DISABLE_IN_OFFLINE_MODE: readonly string[] = [
${renderFlatList(fullRuleNames(tables.requiresNetwork))}
];

export const RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT: Readonly<Partial<Record<string, boolean>>> = {
${fullRuleNames(tables.autofixDisabled)
  .map((ruleName) => `  '${ruleName}': true,`)
  .join('\n')}
};

export const RULES_TO_DISABLE_IN_TEST_FILES: readonly string[] = [
${renderFlatList(fullRuleNames(tables.disableInTestFiles))}
];

export const ALL_STYLISTIC_RULES: RulesPerPlugin<true> = {
${renderPerPlugin(tables.stylistic, () => 'true')}
};

export type AllStylisticRules =${renderUnion(fullRuleNames(tables.stylistic))};

export const RULES_INCOMPATIBLE_WITH_PRETTIER: RulesPerPlugin<true> = {
${renderPerPlugin(tables.prettierIncompatible, () => 'true')}
};

export type PrettierIncompatibleRuleName =${renderUnion(fullRuleNames(prettierMentioned))};

export const PLUGINS_BY_PRETTIER_LANGUAGE = {
${renderPrettierLanguages(plugins)}
} as const;

export const RULES_ADJUSTED_FOR_CLI_FILES: RulesPerPlugin<'off' | 'error'> = {
${renderPerPlugin(tables.cliFiles, (value) => `'${String(value)}'`)}
};

export type CliAdjustedRuleName =${renderUnion(fullRuleNames(tables.cliFiles))};

export const RULES_REQUIRING_TYPE_INFORMATION: Readonly<Partial<Record<string, TypeInfoRequirement>>> = {
${renderTypeInfo(plugins, tables.requiresTypeInfo)}
};

/**
 * The rules that have a built-in replacement, keyed by the canonical plugin prefix and the rule
 * name.
 * The tables above list a rule replaced by default with the traits of the rule replacing it
 */
export const BUILTIN_RULE_REPLACEMENTS: Readonly<Partial<Record<string, Partial<Record<string, BuiltinRuleReplacement>>>>> = {
${renderReplacements(replacements, tablesWithoutReplacements)}
};

export type BuiltinReplacedRuleName =${renderUnion(replacements.map(({target}) => target))};
`;
};

const CONFIG_UN_SHARED_PATH = pathe.join(ROOT_DIRECTORY, 'src/config-un/shared.ts');

const AUTOFIX_DEFAULTS_JSDOC_INTRO =
  '`rules` object will be merged with the default value, which disables autofix for these rules:\n';
const JSDOC_EMPTY_LINE = '   *\n';

/**
 * Lists the rules with autofix disabled by default in the JSDoc of the root option
 */
const writeAutofixDefaultsJsdoc = async (plugins: readonly DiscoveredPlugin[]) => {
  const source = await fs.readFile(CONFIG_UN_SHARED_PATH, 'utf8');
  const intro = source.indexOf(AUTOFIX_DEFAULTS_JSDOC_INTRO);
  const listEnd = intro === -1 ? -1 : source.indexOf(JSDOC_EMPTY_LINE, intro);
  if (listEnd === -1) {
    throw new Error(
      `The list of rules with autofix disabled by default is missing from the JSDoc in ${CONFIG_UN_SHARED_PATH}`,
    );
  }

  const pluginsByPrefix = keyedBy(plugins, (plugin) => plugin.prefix);
  const list = withDefaultReplacements(
    collectTrait(plugins, 'autofixDisabled'),
    collectRuleReplacementsOnByDefault(plugins),
  )
    .map(({prefix, ruleName, fullRuleName}) => {
      const plugin = pluginsByPrefix.get(prefix);
      const url = plugin && getRuleDocsUrl(plugin.metadata, ruleName);
      return `   * - ${url ? `[\`${fullRuleName}\`](${url})` : `\`${fullRuleName}\``}\n`;
    })
    .join('');
  // The rules are listed in the JSDoc too, so that they show up on hover
  await fs.writeFile(
    CONFIG_UN_SHARED_PATH,
    `${source.slice(0, intro + AUTOFIX_DEFAULTS_JSDOC_INTRO.length)}${list}${source.slice(listEnd)}`,
  );
};

export const writePluginMetadataArtifacts = async (format: (code: string) => Promise<string>) => {
  const plugins = await readPluginMetadata();

  const {errors, warnings} = validate(plugins);
  invariant(
    errors.length === 0,
    `Invalid plugin metadata:\n${errors.map((error) => `- ${error}`).join('\n')}`,
  );

  const code = await format(renderArtifacts(plugins));
  await Promise.all([
    fs.writeFile(pathe.join(ROOT_DIRECTORY, 'src/plugins.gen.ts'), code),
    writeAutofixDefaultsJsdoc(plugins),
  ]);

  return {pluginsCount: plugins.length, warnings};
};
