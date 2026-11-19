import type {ConfigKey} from '../configs/index.gen';
import type {EslintFullRuleName, GetRuleNamesInPlugin} from '../eslint/eslint-types';
import type {PluginPrefix} from '../loaders';
import {allUnionMembers} from '../utils';

/**
 * A trait value, optionally carrying the reason behind it.
 * A `false` value records a deliberately rejected candidate and must always say why, so that the
 * decision survives the next time the rule changes upstream
 */
export type MaybeWithReason<Value> = Value | readonly [value: Value | false, reason: string];

/**
 * Why a rule is meaningless or misleading in an isolated snippet.
 *
 * - `processorDefault` means the rule is already disabled by the default markdown processor config.
 * - `fileName` means the rule reads the file name or role, which a snippet takes from its Markdown
 * file.
 * - `alternatives` means the rule reports a snippet showing several ways to do the same thing.
 * - `fragment` means the rule judges a whole Markdown document, which a snippet is only a part of.
 * - `typeAware` is for the rules that only degrade without type information: the ones that
 * throw are disabled in code blocks automatically.
 * - `typeStrictness` means the rule asks for strict or explicit types, which a snippet nobody
 * type-checks doesn't need
 */
type CodeBlocksReason =
  | 'alternatives'
  | 'emptiness'
  | 'eval'
  | 'fileName'
  | 'fragment'
  | 'imports'
  | 'performance'
  | 'processorDefault'
  | 'runtimeOnly'
  | 'tooStrict'
  | 'typeAware'
  | 'typeStrictness'
  | 'unused';

/**
 * What a rule is known for: the traits decide which of our Configs turn it off, move it or adjust
 * it
 */
// The only list of the traits. The docs of each one are also what the user reads in the `traits`
// option of a rule replacement, so they must not be about the plugin metadata
export interface RuleTraits {
  /**
   * `true` if the rule throws without type information, `'optional'` if it only works worse
   * without it.
   * Such rules are moved into separate configs, see the `typeInfoRules` option
   */
  // Not written in the metadata of a plugin whose rules declare it themselves: the generator reads
  // it from them
  requiresTypeInfo?: MaybeWithReason<true | 'optional'>;

  /**
   * The rule makes network requests, so it is turned off in the offline mode
   */
  requiresNetwork?: MaybeWithReason<true>;

  /**
   * Fixing what the rule reports never changes how the code works.
   * Such rules are turned off by the `noStylisticRules` Config
   */
  stylistic?: MaybeWithReason<true>;

  /**
   * The rule conflicts with Prettier, so the `noPrettierIncompatibleRules` Config turns it off.
   * For a plugin whose language Prettier only formats with a plugin, that Config's `languages`
   * option decides
   */
  prettierIncompatible?: MaybeWithReason<true>;

  /**
   * The rule stays on, but its autofix is disabled by default, see the
   * `autofixDisabledGloballyFor` option
   */
  autofixDisabled?: MaybeWithReason<true>;

  /**
   * The rule is turned off in the code blocks of Markdown files.
   * `requiresTypeInfo: true` implies it
   */
  disableInCodeBlocks?: MaybeWithReason<CodeBlocksReason>;

  /**
   * The rule is turned off in the code compiled from Civet files, as it reports the code the
   * compiler generates.
   * `prettierIncompatible` implies it
   */
  disableInCivetCompiledCode?: MaybeWithReason<true>;

  /**
   * The rule is turned off in test files by the `tests` Config
   */
  disableInTestFiles?: MaybeWithReason<true>;

  /**
   * The severity the `cli` Config sets for the rule in the files meant to be run as executables
   */
  cliFiles?: MaybeWithReason<'off' | 'error'>;
}

/**
 * What the metadata of a plugin says about one of its rules: the traits of the rule, and the rule
 * replacing it
 */
export interface RuleMetadata extends RuleTraits {
  /**
   * The full name of a rule of another plugin that implements this one differently.
   * It runs under the name of this rule and takes its traits.
   * The object form with `isOptIn` is for a replacement that is only applied when the user turns
   * it on
   */
  replacedBy?: EslintFullRuleName | {rule: EslintFullRuleName; isOptIn: true};
}

/**
 * The order in which the traits are authored, rendered and reported
 */
export const RULE_TRAITS_ORDERED = allUnionMembers<keyof RuleTraits, {readonly: true}>()([
  'requiresTypeInfo',
  'requiresNetwork',
  'stylistic',
  'prettierIncompatible',
  'autofixDisabled',
  'disableInCodeBlocks',
  'disableInCivetCompiledCode',
  'disableInTestFiles',
  'cliFiles',
]);

/**
 * The order in which the keys of a rule's metadata are authored
 */
export const RULE_METADATA_KEY_ORDER = allUnionMembers<keyof RuleMetadata, {readonly: true}>()([
  ...RULE_TRAITS_ORDERED,
  'replacedBy',
]);

export type RuleTrait = keyof RuleTraits;

/**
 * The traits a rule ends up with in the generated tables, without the reasons: a rule is only
 * listed as disabled in code blocks, whatever the reason
 */
export type RuleTraitValues = {
  [Trait in RuleTrait]?: Trait extends 'disableInCodeBlocks'
    ? true
    : Exclude<RuleTraits[Trait], readonly unknown[] | undefined>;
};

/**
 * A rule replaced by another implementation, as the generated table describes it
 */
export interface BuiltinRuleReplacement {
  /**
   * The full name of the replacing rule
   */
  rule: string;

  isOnByDefault: boolean;

  /**
   * The traits the rule has without the replacement, only stored when it is on by default: the
   * generated tables then describe the replacing rule instead
   */
  originalTraits?: RuleTraitValues;
}

/**
 * The rules having a trait, keyed by the plugin prefix and then by the rule name, as some of the
 * generated tables list them
 */
export type RulesPerPlugin<Value> = Readonly<
  Partial<Record<string, Readonly<Partial<Record<string, Value>>>>>
>;

/**
 * The generated shape the type-information split reads
 */
export interface TypeInfoRequirement {
  rules: Partial<Record<string, true | 'optional'>>;
  extraPatterns?: readonly string[];
  extraFileExtensions?: readonly `.${string}`[];
}

export interface PluginMetadata<Prefix extends PluginPrefix = PluginPrefix> {
  /**
   * The Configs this plugin serves.
   * Only the pseudo-plugin holding the rules of ESLint itself serves none
   */
  configs?: readonly ConfigKey[];

  /**
   * Only meaningful for a plugin serving a Config several plugins serve: says which of them the
   * generated `🧩 Main plugin` line of that Config names
   */
  isMainPlugin?: true;

  docsUrl?: string | {label: string; url: string};

  /**
   * `ref` is the rule's entry in `ruleDocsRefs`, `undefined` for a rule documented on the default
   * branch
   */
  ruleDocsUrl?: (ruleName: string, ref: string | undefined) => string;

  /**
   * Rules whose docs page is gone from the default branch: the git ref of the last release that had
   * it.
   * `null` for a rule that never had a page of its own, which then links to `docsUrl`
   */
  ruleDocsRefs?: Partial<Record<GetRuleNamesInPlugin<Prefix>, string | null>>;

  gitTag?: string | ((version: string) => string | {url: string});

  /**
   * The prefix the plugin docs suggest, only set when we register it under a different one.
   * Feeds the renames table of the readme, hence the required reason
   */
  suggestedPrefix?: readonly [prefix: string, reason: string];

  /**
   * The language whose formatting Prettier owns for this plugin's rules
   */
  prettierLanguage?: string;

  /**
   * Every rule of the plugin is stylistic, so none of them is listed individually
   */
  allRulesStylistic?: true;

  /**
   * Why the package stays a direct dependency though every Config it serves is off by default.
   * Providing it when some served Config is enabled by default is reported as an error
   */
  directDependencyReason?: string;

  /**
   * Why the package is an optional peer dependency although it serves a Config of the misc group,
   * which `defaultConfigsStatus: 'misc-enabled'` turns on in one go and would therefore normally
   * require the package to be installed for the user.
   * Providing it when the package is a direct dependency is reported as an error
   */
  optionalPeerDependencyReason?: string;

  /**
   * Extends the reach of the generated type-aware config beyond TypeScript files
   */
  typeInfo?: {
    extraPatterns?: readonly string[];
    extraFileExtensions?: readonly `.${string}`[];
  };

  rules: Partial<Record<GetRuleNamesInPlugin<Prefix>, RuleMetadata>>;
}

export const definePluginMetadata = <const Prefix extends PluginPrefix>(
  prefix: Prefix,
  metadata: PluginMetadata<Prefix>,
) => ({prefix, ...metadata});

/**
 * The order the metadata keys are authored in, `typeInfo`'s own keys included
 */
export const PLUGIN_METADATA_KEY_ORDER = allUnionMembers<
  keyof PluginMetadata | keyof NonNullable<PluginMetadata['typeInfo']>,
  {readonly: true}
>()([
  'configs',
  'isMainPlugin',
  'docsUrl',
  'ruleDocsUrl',
  'ruleDocsRefs',
  'gitTag',
  'suggestedPrefix',
  'prettierLanguage',
  'allRulesStylistic',
  'directDependencyReason',
  'optionalPeerDependencyReason',
  'typeInfo',
  'extraPatterns',
  'extraFileExtensions',
  'rules',
]);

/**
 * The release of a package is tagged with the version as is
 */
export const gitTagAsVersion = (version: string) => version;

/**
 * The tagging scheme of a package could not be worked out
 */
export const gitTagUnknown = () => '';

const HTML_ESLINT_RULES_WITHOUT_FRAMEWORK_PAGE: ReadonlySet<string> = new Set([
  'id-naming-convention',
  'no-restricted-tags',
  'require-li-container',
]);

/**
 * The docs of the html-eslint framework plugins have no pages for some rules, so those link to the
 * page of the same rule of the HTML plugin
 */
export const htmlEslintFrameworkRuleDocsUrl = (framework: string) => (ruleName: string) =>
  HTML_ESLINT_RULES_WITHOUT_FRAMEWORK_PAGE.has(ruleName)
    ? `https://html-eslint.org/docs/rules/${ruleName}`
    : `https://html-eslint.org/docs/${framework}/rules/${ruleName}`;
