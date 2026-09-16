import fs from 'node:fs/promises';
import pathe from 'pathe';
import {RULE_CATEGORIES_PER_PLUGIN} from '../../../src/eslint-rule-categories.gen';
import {ALL_RULES_PER_PLUGIN} from '../../../src/eslint-rules.gen';
import {FIXABLE_RULES_PER_PLUGIN} from '../../../src/eslint-types-fixable-only.gen';
import {pluginsLoaders} from '../../../src/loaders/plugins';
import {
  type MaybeWithReason,
  RULE_TRAIT_ORDER,
  type RuleMetadata,
} from '../../../src/plugins/shared';
import {stylePluginPrefix, styleRuleName, styleText} from '../../../src/utils';
import {type DiscoveredPlugin, readPluginMetadata} from '../../shared/plugin-metadata';

const ROOT_DIR = pathe.join(import.meta.dirname, '../../..');
type Trait = keyof RuleMetadata;

const styleTrait = (trait: Trait) => styleText('cyan', trait);
const styleFileName = (fileName: string) => styleText('yellow', fileName);

const RULE_NAMES_PER_PLUGIN: Partial<Record<string, readonly string[]>> = ALL_RULES_PER_PLUGIN;

const PLUGIN_LOADERS: Partial<Record<string, {packageName: string}>> = pluginsLoaders;

/**
 * The plugins whose rules declare the requirement themselves.
 * Listing a rule by hand there is an override, and only allowed when it says something the plugin
 * does not
 */
const TYPE_AWARE_CATEGORIES: Partial<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(RULE_CATEGORIES_PER_PLUGIN).flatMap(([prefix, categories]) =>
    'typeAware' in categories ? [[prefix, categories.typeAware]] : [],
  ),
);

interface TraitEntry {
  value: boolean | string;
  reason: string | null;
}

/**
 * Collapses the terse and the annotated notations into the same pair
 */
const readTrait = (traits: RuleMetadata, trait: Trait): TraitEntry | null => {
  const entry: MaybeWithReason<boolean | string> | undefined = traits[trait];
  if (entry == null) {
    return null;
  }
  return typeof entry === 'object'
    ? {value: entry[0], reason: entry[1]}
    : {value: entry, reason: null};
};

const prefixRuleName = (prefix: string, ruleName: string) =>
  prefix ? `${prefix}/${ruleName}` : ruleName;

const ruleEntries = ({prefix, metadata}: DiscoveredPlugin) =>
  Object.entries(metadata.rules).map(([ruleName, traits]) => ({
    ruleName,
    fullRuleName: prefixRuleName(prefix, ruleName),
    traits,
  }));

const validate = (plugins: readonly DiscoveredPlugin[]) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const declaredPrefixes = new Set(plugins.map(({prefix}) => prefix));
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

    if (prefix === '') {
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

      RULE_TRAIT_ORDER.forEach((trait) => {
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
          value: true as const,
        }))
      : [],
  ),
];

/**
 * Every rule carrying the trait, with the rejections left out
 */
const collectTrait = (
  plugins: readonly DiscoveredPlugin[],
  trait: Trait,
  {includeRejections = false} = {},
) =>
  plugins.flatMap((plugin) =>
    ruleEntries(plugin).flatMap(({ruleName, fullRuleName, traits}) => {
      const entry = readTrait(traits, trait);
      return entry == null || (!includeRejections && entry.value === false)
        ? []
        : [{prefix: plugin.prefix, ruleName, fullRuleName, value: entry.value}];
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
 * What the plugin reports itself, minus the rules a hand-written entry already speaks for: the
 * plugin only says that type information is used, never whether the rule survives without it
 */
const withTypeAwareCategories = (plugins: readonly DiscoveredPlugin[], rules: CollectedRules) => {
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
          : [
              {
                prefix,
                ruleName,
                fullRuleName: prefixRuleName(prefix, ruleName),
                value: true as const,
              },
            ],
      ),
    ),
  ];
};

const renderTypeInfo = (plugins: readonly DiscoveredPlugin[], rules: CollectedRules) =>
  Array.from(
    Map.groupBy(rules, ({prefix}) => prefix),
    ([prefix, pluginRules]) => {
      const extra = plugins.find((plugin) => plugin.prefix === prefix)?.metadata.typeInfo;
      return [
        `  '${prefix}': {`,
        '    rules: {',
        ...pluginRules
          .toSorted((left, right) => left.ruleName.localeCompare(right.ruleName))
          .map(({ruleName, value}) => `      '${ruleName}': ${JSON.stringify(value)},`),
        '    },',
        ...(['extraPatterns', 'extraFileExtensions'] as const).flatMap((key) =>
          extra?.[key] ? [`    ${key}: ${JSON.stringify(extra[key])},`] : [],
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
    .toSorted()
    .join('\n');

const renderArtifacts = (plugins: readonly DiscoveredPlugin[]) => {
  const codeBlocks = collectTrait(plugins, 'disableInCodeBlocks');
  const stylistic = withAllStylisticRules(plugins, collectTrait(plugins, 'stylistic'));
  const typeInfo = collectTrait(plugins, 'requiresTypeInfo');
  const autofix = collectTrait(plugins, 'autofixDisabled');
  const prettier = collectTrait(plugins, 'prettierIncompatible');
  // A rejected rule stays configurable through the config's own options, so it stays in the union
  const prettierMentioned = collectTrait(plugins, 'prettierIncompatible', {
    includeRejections: true,
  });
  const testFiles = collectTrait(plugins, 'disableInTestFiles');
  const cliFiles = collectTrait(plugins, 'cliFiles');
  const network = collectTrait(plugins, 'requiresNetwork');

  return `import type {TypeInfoRequirement} from './plugins/shared';

export const RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS = [
${renderFlatList(fullRuleNames(codeBlocks))}
] as const;

export type RulesDisabledInEmbeddedCodeBlocksByDefault =${renderUnion(fullRuleNames(codeBlocks))};

export const RULES_TO_DISABLE_IN_OFFLINE_MODE = [
${renderFlatList(fullRuleNames(network))}
] as const;

export const RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT = {
${fullRuleNames(autofix)
  .map((ruleName) => `  '${ruleName}': true,`)
  .join('\n')}
} as const;

export const RULES_TO_DISABLE_IN_TEST_FILES = [
${renderFlatList(fullRuleNames(testFiles))}
] as const;

export const ALL_STYLISTIC_RULES = {
${renderPerPlugin(stylistic, () => 'true')}
} as const;

export type AllStylisticRules =${renderUnion(fullRuleNames(stylistic))};

export const RULES_INCOMPATIBLE_WITH_PRETTIER = {
${renderPerPlugin(prettier, () => 'true')}
} as const;

export type PrettierIncompatibleRuleName =${renderUnion(fullRuleNames(prettierMentioned))};

export const PLUGINS_BY_PRETTIER_LANGUAGE = {
${renderPrettierLanguages(plugins)}
} as const;

export const RULES_ADJUSTED_FOR_CLI_FILES = {
${renderPerPlugin(cliFiles, (value) => `'${String(value)}'`)}
} as const;

export type CliAdjustedRuleName =${renderUnion(fullRuleNames(cliFiles))};

export const RULES_REQUIRING_TYPE_INFORMATION: Partial<Record<string, TypeInfoRequirement>> = {
${renderTypeInfo(plugins, withTypeAwareCategories(plugins, typeInfo))}
};
`;
};

export const writePluginMetadataArtifacts = async (format: (code: string) => Promise<string>) => {
  const plugins = await readPluginMetadata();

  const {errors, warnings} = validate(plugins);
  if (errors.length > 0) {
    throw new Error(`Invalid plugin metadata:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }

  const code = await format(renderArtifacts(plugins));
  await fs.writeFile(pathe.join(ROOT_DIR, 'src/plugins.gen.ts'), code);

  return {pluginsCount: plugins.length, warnings};
};
