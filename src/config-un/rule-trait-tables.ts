import {prefixRuleName} from '../eslint/eslint-utils';
import {
  RULE_TRAITS_ORDERED,
  type RuleTrait,
  type RuleTraitValues,
  type RulesPerPlugin,
  type TypeInfoRequirement,
} from '../plugins/shared';
import {
  ALL_STYLISTIC_RULES,
  BUILTIN_RULE_REPLACEMENTS,
  RULES_ADJUSTED_FOR_CLI_FILES,
  RULES_INCOMPATIBLE_WITH_PRETTIER,
  RULES_REQUIRING_TYPE_INFORMATION,
  RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT,
  RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS,
  RULES_TO_DISABLE_IN_OFFLINE_MODE,
  RULES_TO_DISABLE_IN_TEST_FILES,
} from '../plugins.gen';
import {omit} from '../utils';
import type {RuleReplacementTraits} from './rule-replacement-types';

const GENERATED_RULE_TRAITS = {
  requiresTypeInfo: RULES_REQUIRING_TYPE_INFORMATION,
  requiresNetwork: RULES_TO_DISABLE_IN_OFFLINE_MODE,
  stylistic: ALL_STYLISTIC_RULES,
  prettierIncompatible: RULES_INCOMPATIBLE_WITH_PRETTIER,
  autofixDisabled: RULES_TO_DISABLE_AUTOFIX_GLOBALLY_BY_DEFAULT,
  disableInCodeBlocks: RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS,
  disableInTestFiles: RULES_TO_DISABLE_IN_TEST_FILES,
  cliFiles: RULES_ADJUSTED_FOR_CLI_FILES,
} satisfies Record<RuleTrait, unknown>;

/**
 * The rules having each trait, in the shapes the generated tables have
 */
export type RuleTraitTables = typeof GENERATED_RULE_TRAITS;

interface TraitValueChange<Value> {
  pluginPrefix: string;
  ruleName: string;
  value: Value | undefined;
}

/**
 * Reads and changes the table of a single trait
 */
interface TraitTableAccess<Table, Value> {
  read: (table: Table, pluginPrefix: string, ruleName: string) => Value | undefined;
  withChanges: (table: Table, changes: readonly TraitValueChange<Value>[]) => Table;
}

const getFullRuleNames = (changes: readonly TraitValueChange<unknown>[]) =>
  changes.map(({pluginPrefix, ruleName}) => prefixRuleName(pluginPrefix, ruleName));

const getFullRuleNamesHavingTrait = (changes: readonly TraitValueChange<unknown>[]) =>
  getFullRuleNames(changes.filter(({value}) => value != null));

const ruleListAccess: TraitTableAccess<readonly string[], true> = {
  read: (ruleNames, pluginPrefix, ruleName) =>
    ruleNames.includes(prefixRuleName(pluginPrefix, ruleName)) || undefined,
  withChanges: (ruleNames, changes) => {
    const changedRuleNames: ReadonlySet<string> = new Set(getFullRuleNames(changes));
    return [
      ...ruleNames.filter((ruleName) => !changedRuleNames.has(ruleName)),
      ...getFullRuleNamesHavingTrait(changes),
    ];
  },
};

const ruleRecordAccess: TraitTableAccess<RuleTraitTables['autofixDisabled'], true> = {
  read: (rules, pluginPrefix, ruleName) =>
    rules[prefixRuleName(pluginPrefix, ruleName)] || undefined,
  withChanges: (rules, changes) => ({
    ...omit(rules, getFullRuleNames(changes)),
    ...Object.fromEntries(getFullRuleNamesHavingTrait(changes).map((ruleName) => [ruleName, true])),
  }),
};

const createRulesPerPluginAccess = <Value>(): TraitTableAccess<RulesPerPlugin<Value>, Value> => ({
  read: (rulesPerPlugin, pluginPrefix, ruleName) => rulesPerPlugin[pluginPrefix]?.[ruleName],
  withChanges: (rulesPerPlugin, changes) =>
    changes.reduce<Partial<Record<string, Partial<Record<string, Value>>>>>(
      (acc, {pluginPrefix, ruleName, value}) => {
        const rules = omit(acc[pluginPrefix] || {}, [ruleName]);
        acc[pluginPrefix] = value == null ? rules : {...rules, [ruleName]: value};
        return acc;
      },
      {...rulesPerPlugin},
    ),
});

const typeInfoAccess: TraitTableAccess<RuleTraitTables['requiresTypeInfo'], true | 'optional'> = {
  read: (requirements, pluginPrefix, ruleName) => requirements[pluginPrefix]?.rules[ruleName],
  withChanges: (requirements, changes) =>
    changes.reduce<Partial<Record<string, TypeInfoRequirement>>>(
      (acc, {pluginPrefix, ruleName, value}) => {
        const rules = omit(acc[pluginPrefix]?.rules || {}, [ruleName]);
        acc[pluginPrefix] = {
          ...acc[pluginPrefix],
          rules: value == null ? rules : {...rules, [ruleName]: value},
        };
        return acc;
      },
      {...requirements},
    ),
};

const TRAIT_TABLES_ACCESS: Readonly<{
  [Trait in RuleTrait]: TraitTableAccess<
    RuleTraitTables[Trait],
    NonNullable<RuleTraitValues[Trait]>
  >;
}> = {
  requiresTypeInfo: typeInfoAccess,
  requiresNetwork: ruleListAccess,
  stylistic: createRulesPerPluginAccess(),
  prettierIncompatible: createRulesPerPluginAccess(),
  autofixDisabled: ruleRecordAccess,
  disableInCodeBlocks: ruleListAccess,
  disableInTestFiles: ruleListAccess,
  cliFiles: createRulesPerPluginAccess(),
};

// eslint-disable-next-line ts/no-unnecessary-type-parameters -- Only a type parameter makes the body checked per trait
const withDefaultTrait = <Trait extends RuleTrait>(
  traits: RuleTraitValues,
  trait: Trait,
  pluginPrefix: string,
  ruleName: string,
) => {
  traits[trait] = TRAIT_TABLES_ACCESS[trait].read(
    GENERATED_RULE_TRAITS[trait],
    pluginPrefix,
    ruleName,
  );
  return traits;
};

/**
 * The traits a rule gets, to write into the tables
 */
export interface RuleTraitsChange {
  pluginPrefix: string;
  ruleName: string;
  traits: RuleTraitValues;
}

// eslint-disable-next-line ts/no-unnecessary-type-parameters -- Only a type parameter makes the body checked per trait
const withChangedTraitTable = <Trait extends RuleTrait>(
  tables: RuleTraitTables,
  trait: Trait,
  changes: readonly RuleTraitsChange[],
) => {
  tables[trait] = TRAIT_TABLES_ACCESS[trait].withChanges(
    GENERATED_RULE_TRAITS[trait],
    changes.map(({pluginPrefix, ruleName, traits}) => ({
      pluginPrefix,
      ruleName,
      // Lets the type checker see that the value is not nullable
      value: traits[trait] || undefined,
    })),
  );
  return tables;
};

const readDefaultRuleTraits = (pluginPrefix: string, ruleName: string) =>
  RULE_TRAITS_ORDERED.reduce<RuleTraitValues>(
    (acc, trait) => withDefaultTrait(acc, trait, pluginPrefix, ruleName),
    {},
  );

const overrideTrait = <Value>(
  value: Value | undefined,
  override: Value | false | null | undefined,
) => (override === undefined ? value : override || undefined);

/**
 * Returns the traits with the overrides of the user applied
 */
// Every trait is listed by hand, so that a new one fails the type check until it is handled here
const withOverriddenTraits = (
  traits: RuleTraitValues,
  overrides: RuleReplacementTraits,
): {[Trait in RuleTrait]: RuleTraitValues[Trait]} => ({
  requiresTypeInfo: overrideTrait(traits.requiresTypeInfo, overrides.requiresTypeInfo),
  requiresNetwork: overrideTrait(traits.requiresNetwork, overrides.requiresNetwork),
  stylistic: overrideTrait(traits.stylistic, overrides.stylistic),
  prettierIncompatible: overrideTrait(traits.prettierIncompatible, overrides.prettierIncompatible),
  autofixDisabled: overrideTrait(traits.autofixDisabled, overrides.autofixDisabled),
  disableInCodeBlocks: overrideTrait(
    traits.disableInCodeBlocks,
    // Code blocks never get type information
    overrides.disableInCodeBlocks ?? (overrides.requiresTypeInfo === true || undefined),
  ),
  disableInTestFiles: overrideTrait(traits.disableInTestFiles, overrides.disableInTestFiles),
  cliFiles: overrideTrait(traits.cliFiles, overrides.cliFiles),
});

const areTraitsEqual = (left: RuleTraitValues, right: RuleTraitValues) =>
  RULE_TRAITS_ORDERED.every((trait) => left[trait] === right[trait]);

/**
 * Returns the traits a rule ends up with: the ones of `traitsOwner`, with the overrides of the
 * user applied.
 * Returns `null` when they are the same as the ones the generated tables give the rule
 */
export const getRuleTraitsChange = (
  pluginPrefix: string,
  ruleName: string,
  traitsOwner: {pluginPrefix: string; ruleName: string},
  overrides: RuleReplacementTraits | undefined,
): RuleTraitsChange | null => {
  const {pluginPrefix: ownerPluginPrefix, ruleName: ownerRuleName} = traitsOwner;
  const builtinReplacement = BUILTIN_RULE_REPLACEMENTS[ownerPluginPrefix]?.[ownerRuleName];
  const ownerTraits =
    (builtinReplacement?.isOnByDefault && builtinReplacement.originalTraits) ||
    readDefaultRuleTraits(ownerPluginPrefix, ownerRuleName);
  const traits = overrides ? withOverriddenTraits(ownerTraits, overrides) : ownerTraits;
  return areTraitsEqual(traits, readDefaultRuleTraits(pluginPrefix, ruleName))
    ? null
    : {pluginPrefix, ruleName, traits};
};

/**
 * Returns the trait tables with the given changes applied, or the generated tables themselves
 * when there are no changes
 */
export const resolveRuleTraitTables = (
  changes: readonly RuleTraitsChange[],
): Readonly<RuleTraitTables> =>
  changes.length > 0
    ? RULE_TRAITS_ORDERED.reduce<RuleTraitTables>(
        (acc, trait) => withChangedTraitTable(acc, trait, changes),
        {...GENERATED_RULE_TRAITS},
      )
    : GENERATED_RULE_TRAITS;
