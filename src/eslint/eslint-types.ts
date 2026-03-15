// @eslint/core gets resolved to v1, which is incompatible with eslint@9
import type {
  ConfigObject as EslintConfigObject,
  Plugin as EslintPlugin,
  Severity as EslintSeverity,
} from '@eslint/core0';
import type Eslint from 'eslint';
import type {ExtraPluginsType} from '../config-un/shared';
import type {FixableRuleNames as UnFixableRuleNames} from '../eslint-types-fixable-only.gen';
import type {RuleOptionsPerPlugin as UnRuleOptionsByPlugin} from '../eslint-types-per-plugin.gen';
import type {RuleOptions as UnRulesConfig} from '../eslint-types.gen';
import type {PluginPrefix} from '../loaders';
import type {
  ObjectValues,
  OmitIndexSignature,
  PickKeysNotStartingWith,
  ReadonlyDeep,
  UnionToIntersection,
} from '../types';
import type {MaybeFn} from '../utils';

// #region 🟠 eslint-config-un specific types

export type {UnRulesConfig, UnRuleOptionsByPlugin, UnFixableRuleNames};

export type UnAllRuleNames = keyof UnRulesConfig;

interface UnFlatConfigEntryFilesOnly {
  /**
   * Pass an empty array to disable the config. Note that if the config has
   * "sub-configs", *most of the time* WON'T disabled unless otherwise stated in the config docs.
   * The good example of the config which doesn't follow this rule is `ts` config,
   * which disables type-aware sub-config too if `files` is empty array and no files
   * are passed explicitly to the sub-config.
   */
  files?: string[];
}

/**
 * Similar to ESLint's flat config entry type, but with eslint-config-un specific
 * JSDoc comments.
 */
export interface UnFlatConfigEntryFilesAndIgnores extends UnFlatConfigEntryFilesOnly {
  ignores?: string[];
}

interface DisabledAutofixOption {
  /**
   * Disables autofix for this rule only for this config with a caveat
   * that the rule name will be prepended with `disable-autofix/`.
   *
   * If you'd like to disable autofix without changing the rule name,
   * it's only currently possible to do so globally (for all configs at once).
   * For that, please use `autofixDisabledGloballyFor` root option.
   */
  disableAutofix?: boolean;
}

export type UnFlatConfigEntryOverridesEntry<
  RuleName extends string = string,
  Options extends readonly unknown[] = readonly unknown[],
> = MaybeFn<
  | ReadonlyDeep<EslintRuleEntry<Options>>
  | ({
      severity: EslintSeverity;
      options?: Options;

      files?: string[];
      ignores?: string[];
    } & (RuleName extends UnFixableRuleNames
      ? DisabledAutofixOption
      : string extends RuleName
        ? DisabledAutofixOption
        : unknown)),
  [severity: EslintSeverity & number, options?: Options]
>;

export type UnFlatConfigEntryOverridesType<T> = {
  [RuleName in keyof T]?: T[RuleName] & {} extends EslintRuleEntry<infer Options>
    ? UnFlatConfigEntryOverridesEntry<RuleName & string, ReadonlyDeep<Options>>
    : never;
};

export type UnExtraPluginsRules<ExtraPlugins extends ExtraPluginsType> = ObjectValues<{
  [PluginKey in keyof ExtraPlugins & string]: `${PluginKey}/${keyof (Awaited<
    ExtraPlugins[PluginKey] extends (...args: unknown[]) => EslintPlugin
      ? ReturnType<ExtraPlugins[PluginKey]>
      : ExtraPlugins[PluginKey] & EslintPlugin
  >['rules'] & {}) &
    string}`;
}>;

export type UnExtraPluginsRulesConfig<ExtraPlugins extends ExtraPluginsType> = Partial<
  Record<UnExtraPluginsRules<ExtraPlugins>, EslintRuleEntry>
>;

type PluginAndPrefixToFullRuleName<P extends PluginPrefix, N extends string> = P extends ''
  ? N
  : `${P}/${N}`;

export type UnRulesConfigPartial<
  P extends null | PluginPrefix | EslintTypedRulesConfig = PluginPrefix,
> = P extends PluginPrefix
  ? {
      [N in keyof OmitIndexSignature<UnRuleOptionsByPlugin[P]> as PluginAndPrefixToFullRuleName<
        P,
        N
      >]?: UnRuleOptionsByPlugin[P][N] extends unknown[]
        ? EslintRuleEntry<UnRuleOptionsByPlugin[P][N]>
        : never;
    }
  : P extends EslintTypedRulesConfig
    ? OmitIndexSignature<EslintFlatConfigEntry<P>['rules'] & {}>
    : never;

/**
 * An interface that must implement any Un Config
 */
export interface UnFlatConfigEntryBase<
  ExtraPlugins extends ExtraPluginsType = never,
  T extends null | PluginPrefix | EslintTypedRulesConfig = EslintTypedRulesConfig,
> extends UnFlatConfigEntryFilesAndIgnores {
  overrides?: UnFlatConfigEntryOverridesType<UnionToIntersection<UnRulesConfigPartial<T>>>;

  overridesAny?: UnFlatConfigEntryOverridesType<UnionToIntersection<UnRulesConfigPartial>> &
    UnExtraPluginsRulesConfig<ExtraPlugins>;

  /**
   * Force non-zero severity of all the rules to be `error` or `warning`.
   * The severity forced here will take precedence over the severity forced on the root level.
   */
  forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
}

// #endregion

// #region 🟠 Vanilla ESLint types

export type EslintTypedRulesConfig = Record<string, EslintRuleEntry> & UnRulesConfig;

/**
 * A convenient alias of `ConfigObject` from `@eslint/core`
 */
export type EslintFlatConfigEntry<T extends EslintTypedRulesConfig = EslintTypedRulesConfig> =
  EslintConfigObject<T>;

export type EslintRuleEntry<Options extends readonly unknown[] = readonly unknown[]> =
  Eslint.Linter.RuleEntry<// @ts-expect-error "The type 'readonly unknown[]' is 'readonly' and cannot be assigned to the mutable type 'any[]'" - this is fine, options are not mutated by ESLint
  Options>;

export type {EslintPlugin, EslintSeverity};

// #endregion

// #region 🟠 Auxiliary types

export type GetRuleOptions<
  Prefix extends PluginPrefix,
  RuleName extends keyof UnRuleOptionsByPlugin[Prefix] = keyof UnRuleOptionsByPlugin[Prefix],
  Index extends (keyof UnRuleOptionsByPlugin[Prefix][RuleName] & number) | 0 | 'all' = 0,
  _AllOptions = UnRuleOptionsByPlugin[Prefix][RuleName],
> = Exclude<
  Index extends 'all'
    ? _AllOptions & unknown[]
    : _AllOptions extends readonly unknown[]
      ? Index extends keyof _AllOptions & number
        ? _AllOptions[Index]
        : never
      : _AllOptions,
  undefined
>;

export type GetRuleNamesInPlugin<P extends PluginPrefix | null> = P extends null
  ? keyof UnRuleOptionsByPlugin[keyof UnRuleOptionsByPlugin]
  : keyof OmitIndexSignature<UnRuleOptionsByPlugin[P & keyof UnRuleOptionsByPlugin]>;

export type BuiltinEslintRules = PickKeysNotStartingWith<UnRulesConfig, `${string}/`>;

// #endregion
