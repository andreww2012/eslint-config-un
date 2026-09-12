import type {ConfigKey} from '../configs/index.gen';
import type {GetRuleNamesInPlugin} from '../eslint/eslint-types';
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
 * `processorDefault` means the rule is already disabled by the default markdown processor config
 */
type CodeBlocksReason =
  | 'emptiness'
  | 'eval'
  | 'imports'
  | 'performance'
  | 'processorDefault'
  | 'runtimeOnly'
  | 'tooStrict'
  | 'typeAware'
  | 'unused';

export interface RuleMetadata {
  /**
   * `true` if the rule throws without type information, `'optional'` if it silently degrades.
   * Omitted for the plugins whose rules declare it themselves, which the generator reads instead
   */
  requiresTypeInfo?: MaybeWithReason<true | 'optional'>;

  /**
   * The rule performs network requests, so offline mode turns it off
   */
  requiresNetwork?: MaybeWithReason<true>;

  /**
   * Fixing what the rule reports never changes the behavior of the program
   */
  stylistic?: MaybeWithReason<true>;

  prettierIncompatible?: MaybeWithReason<true>;

  /**
   * The rule stays enabled, but its fixer is not applied
   */
  autofixDisabled?: MaybeWithReason<true>;

  disableInCodeBlocks?: MaybeWithReason<CodeBlocksReason>;

  disableInTestFiles?: MaybeWithReason<true>;

  /**
   * The severity the rule takes in the files meant to be run as executables
   */
  cliFiles?: MaybeWithReason<'off' | 'error'>;
}

/**
 * The generated shape the type-information split reads
 */
export interface TypeInfoRequirement {
  rules: Partial<Record<string, true | 'optional'>>;
  extraPatterns?: string[];
  extraFileExtensions?: `.${string}`[];
}

export interface PluginMetadata<Prefix extends PluginPrefix = PluginPrefix> {
  /**
   * The Configs this plugin serves.
   * Only the pseudo-plugin holding the rules of ESLint itself serves none
   */
  configs?: ConfigKey[];

  /**
   * Only meaningful for a plugin serving a Config several plugins serve: says which of them the
   * generated `🧩 Main plugin` line of that Config names
   */
  isMainPlugin?: true;

  docsUrl?: string | {label: string; url: string};

  ruleDocsUrl?: (ruleName: string) => string;

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
   * Why the package stays a direct dependency although every Config it serves is disabled by
   * default. Providing it when some served Config is enabled by default is reported as an error
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
    extraPatterns?: string[];
    extraFileExtensions?: `.${string}`[];
  };

  rules: Partial<Record<GetRuleNamesInPlugin<Prefix>, RuleMetadata>>;
}

export const definePluginMetadata = <const Prefix extends PluginPrefix>(
  prefix: Prefix,
  metadata: PluginMetadata<Prefix>,
) => ({prefix, ...metadata});

/**
 * The order the traits are authored, rendered and reported in
 */
export const RULE_TRAIT_ORDER = allUnionMembers<keyof RuleMetadata>()([
  'requiresTypeInfo',
  'requiresNetwork',
  'stylistic',
  'prettierIncompatible',
  'autofixDisabled',
  'disableInCodeBlocks',
  'disableInTestFiles',
  'cliFiles',
]);

/**
 * The order the metadata keys are authored in, `typeInfo`'s own keys included
 */
export const PLUGIN_METADATA_KEY_ORDER = allUnionMembers<
  keyof PluginMetadata | keyof NonNullable<PluginMetadata['typeInfo']>
>()([
  'configs',
  'isMainPlugin',
  'docsUrl',
  'ruleDocsUrl',
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
