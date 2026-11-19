import type {RuleDefinition} from '@eslint/core';
import type {FromSchema, JSONSchema} from 'json-schema-to-ts';
import type {
  EslintFullRuleName,
  GetRuleNamesInPlugin,
  UnAllRuleNames,
  UnExtraPluginsRules,
  UnFlatConfigEntryOverridesEntry,
  UnFlatConfigEntryOverridesType,
  UnRulesConfig,
} from '../eslint/eslint-types';
import type {OriginalOptionsOfRulesReplacedByDefault} from '../eslint-types-per-plugin.gen';
import type {PluginPrefix} from '../loaders';
import type {RuleTraitValues, RuleTraits} from '../plugins/shared';
import type {MaybePromise, ReadonlyDeep} from '../types';
import type {ExtraPluginsType} from './shared';

/**
 * The traits to give a rule or to remove from it.
 * `false` removes a trait, and so does `null` for `cliFiles`
 */
// Mapping over `keyof RuleTraits` itself keeps the docs of every trait.
// A trait that is either there or not is removed with `false`. One that only has other values, like
// a severity, is removed with `null`: a lone `false` next to them would read like one more value.
// A helper type for that, `NonNullable` included, would show up by its name in the editor, in
// place of the values
export type RuleReplacementTraits = {
  [Trait in keyof RuleTraits]:
    | RuleTraitValues[Trait]
    | (true extends RuleTraitValues[Trait] ? false : null);
};

// Accepts a rule typed in any way: nothing but `never` can be passed to every `create`
interface RuleLike {
  create: (context: never) => unknown;
  meta?: unknown;
}

// Also covers a function with no parameters, which only loads the rule
type RuleFunction = (original: RuleDefinition) => MaybePromise<RuleLike>;

// Accepts the same functions, but a union of two different signatures gives no type to a
// parameter that has none. A function written in place stops the replacements from being
// inferred, and the options of the other replaced rules would then silently keep their default
// types: this way its untyped parameter is reported instead
type RuleFunctionTypedByHand =
  | RuleFunction
  | ((original: RuleDefinition, _unused?: never) => MaybePromise<RuleLike>);

type RuleSource<RuleName extends string, FunctionType> = RuleName | RuleLike | FunctionType;

/**
 * The value of a single rule in `plugins.<pluginName>.replacements`
 */
export type RuleReplacement<
  RuleName extends string = UnAllRuleNames,
  FunctionType = RuleFunction,
> =
  | boolean
  | RuleSource<RuleName, FunctionType>
  | {
      /**
       * The replacing rule.
       * Its name must be written with the canonical plugin prefix
       */
      rule: RuleSource<RuleName, FunctionType>;

      /**
       * Overrides the traits the rule gets: `false` removes a trait, and so does `null` for
       * `cliFiles`.
       * A rule given by the name of a built-in plugin rule takes the traits of that rule.
       * Any other rule keeps the ones of the rule it replaces, except for an autofix disabled by
       * default, which only a function wrapping the original rule keeps
       */
      traits?: RuleReplacementTraits;

      /**
       * Drops the options our Configs internally set for the rule
       * @default false
       */
      dropOptionsSetByConfigs?: boolean;
    };

// `unknown[]` itself, which an untyped `create` gives, says nothing about the options
type InformativeOptions<Options> = unknown[] extends Options
  ? never
  : Options extends readonly unknown[]
    ? Options
    : never;

type OptionsOfContext<Rule> = Rule extends {create: (context: infer Context) => unknown}
  ? Context extends {options: infer Options}
    ? InformativeOptions<Options>
    : never
  : never;

// Only a tuple keeps the schema of each option: a plain array says nothing
type OptionsOfSchemas<Rule> = Rule extends {meta: {schema?: infer Schemas}}
  ? Schemas extends readonly JSONSchema[]
    ? number extends Schemas['length']
      ? never
      : {
          -readonly [Index in keyof Schemas]?: Schemas[Index] extends JSONSchema
            ? FromSchema<Schemas[Index]>
            : never;
        }
    : never
  : never;

type KnownOptionsOfRule<Rule> = [OptionsOfContext<Rule>] extends [never]
  ? OptionsOfSchemas<Rule>
  : OptionsOfContext<Rule>;

// Nothing is known about the options of a rule that is not typed, so anything goes
type OptionsOfRule<Rule> = [KnownOptionsOfRule<Rule>] extends [never]
  ? readonly unknown[]
  : KnownOptionsOfRule<Rule>;

// The rule of the plugin itself, even when another rule replaces it by default
type OriginalOptionsOf<Target extends string> =
  Target extends keyof OriginalOptionsOfRulesReplacedByDefault
    ? OriginalOptionsOfRulesReplacedByDefault[Target]
    : never;

type OptionsOfSource<Target extends string, Source> = Source extends () => infer Result
  ? OptionsOfRule<Awaited<Result>>
  : Source extends (original: never) => infer Result
    ? // A wrapper keeps the options of the rule it wraps, unless it says otherwise
      [KnownOptionsOfRule<Awaited<Result>>] extends [never]
      ? OriginalOptionsOf<Target>
      : KnownOptionsOfRule<Awaited<Result>>
    : OptionsOfRule<Source>;

type EntryOfOptions<Target extends string, Options> = [Options] extends [never]
  ? never
  : Options extends readonly unknown[]
    ? UnFlatConfigEntryOverridesEntry<Target, ReadonlyDeep<Options>>
    : never;

// A source given by name is the rule of its own plugin, never the one replacing it
type EntryOfSource<
  Target extends string,
  Source,
> = Source extends keyof OriginalOptionsOfRulesReplacedByDefault
  ? EntryOfOptions<Target, OriginalOptionsOfRulesReplacedByDefault[Source]>
  : Source extends keyof UnRulesConfig
    ? NonNullable<UnFlatConfigEntryOverridesType<Pick<UnRulesConfig, Source>>[Source]>
    : EntryOfOptions<Target, OptionsOfSource<Target, Source>>;

// `never` keeps the entry type the rule has by default
type EntryOfValue<Target extends string, Value> = Value extends boolean
  ? Value extends false
    ? EntryOfOptions<Target, OriginalOptionsOf<Target>>
    : never
  : Value extends {rule: infer Source}
    ? EntryOfSource<Target, Source>
    : EntryOfSource<Target, Value>;

// `false` for a whole plugin turns off every replacement it has by default
type PluginRulePairs<Replacements> = {
  [Plugin in keyof Replacements & string]: Replacements[Plugin] extends false
    ? {
        name: Extract<keyof OriginalOptionsOfRulesReplacedByDefault, EslintFullRuleName<Plugin>>;
        value: false;
      }
    : Replacements[Plugin] extends object
      ? {
          [RuleName in keyof Replacements[Plugin] & string]: {
            name: EslintFullRuleName<Plugin, RuleName>;
            value: Replacements[Plugin][RuleName];
          };
        }[keyof Replacements[Plugin] & string]
      : never;
}[keyof Replacements & string];

/**
 * The entry types of the rules whose options follow their replacements, keyed by the full rule
 * name
 */
export type ReplacedRuleEntriesOfPlugins<Replacements> =
  // Catches the type parameter that was not inferred, for example because of an error in the
  // object: mapping over every known rule name would take minutes
  string extends keyof Replacements
    ? never
    : {
        [
          Pair in PluginRulePairs<Replacements> as [
            EntryOfValue<Pair['name'], Pair['value']>,
          ] extends [never]
            ? never
            : Pair['name']
        ]: EntryOfValue<Pair['name'], Pair['value']>;
      };

type AnyRuleReplacementValue<ExtraPlugins extends ExtraPluginsType> = RuleReplacement<
  UnAllRuleNames | UnExtraPluginsRules<ExtraPlugins>,
  RuleFunctionTypedByHand
>;

/**
 * The type of `plugins.<pluginName>.replacements` in `eslintConfig()`.
 * It infers `Replacements` from what is written, reports the rules the plugin does not have and
 * the values that are not replacements, and lists the other rules of the plugin, which is what an
 * editor completes from.
 * With nothing inferred, like in `Parameters<typeof eslintConfig>`, it is the plain type of the
 * option
 */
export type ValidatedPluginReplacements<
  Plugin,
  Replacements,
  ExtraPlugins extends ExtraPluginsType,
  _RuleName extends string = GetRuleNamesInPlugin<Plugin & PluginPrefix>,
> =
  // `Replacements` stands on its own in this branch, which is where it gets inferred from
  Replacements extends boolean
    ? Replacements
    : unknown extends Replacements
      ? boolean | Partial<Record<_RuleName, AnyRuleReplacementValue<ExtraPlugins>>>
      : // The written rules are kept apart from the other ones: intersecting the long union of
        // the expected values with itself is too complex for the type checker
        Partial<
          Record<Exclude<_RuleName, keyof Replacements>, AnyRuleReplacementValue<ExtraPlugins>>
        > & {
          [RuleName in keyof Replacements]: RuleName extends _RuleName
            ? // A value that is not a replacement turns into the expected type, which is then
              // reported and completed from
              Replacements[RuleName] extends AnyRuleReplacementValue<ExtraPlugins>
              ? Replacements[RuleName]
              : AnyRuleReplacementValue<ExtraPlugins>
            : never;
        };
