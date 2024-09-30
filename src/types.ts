import type {TSESLint} from '@typescript-eslint/utils';
import type Eslint from 'eslint';
import type {FlatGitignoreOptions} from 'eslint-config-flat-gitignore';
import type {ImportEslintConfigOptions} from './configs/import';
import type {JsEslintConfigOptions} from './configs/js';
import type {NodeEslintConfigOptions} from './configs/node';
import type {PreferArrowFunctionsEslintConfigOptions} from './configs/prefer-arrow-functions';
import type {PromiseEslintConfigOptions} from './configs/promise';
import type {RegexpEslintConfigOptions} from './configs/regexp';
import type {SecurityEslintConfigOptions} from './configs/security';
import type {TailwindEslintConfigOptions} from './configs/tailwind';
import type {TsEslintConfigOptions} from './configs/ts';
import type {UnicornEslintConfigOptions} from './configs/unicorn';
import type {VueEslintConfigOptions} from './configs/vue';
import type {YamlEslintConfigOptions} from './configs/yaml';
import type {RuleOptions} from './eslint-types';
import type {
  ConstantKeys,
  PickKeysNotStartingWith,
  PickKeysStartingWith,
  PrettifyShallow,
} from './type-utils';

type EslintSeverity = Eslint.Linter.RuleSeverity;

export type RulesRecord = Eslint.Linter.RulesRecord & RuleOptions;
// What's going on with this type? `FlatConfig` needs to be used to be compatible with eslint v8 types (v8's `Config` type is different from v9's `Config` so we can't just use `Config`). But `FlatConfig` was not made generic in v9 types so we need to add extra property that utilizes the generic parameter.
export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = PrettifyShallow<
  Omit<Eslint.Linter.FlatConfig, 'files'> &
    Pick<Eslint.Linter.Config<T>, 'rules'> & {files?: string[]}
>;

// Need to exclude `disable-autofix` rules to avoid TS issues related to big unions
export type AllEslintRules = PickKeysNotStartingWith<
  ConstantKeys<FlatConfigEntry['rules'] & {}>,
  'disable-autofix/'
>;

export type GetRuleOptions<RuleName extends keyof AllEslintRules> =
  AllEslintRules[RuleName] & {} extends Eslint.Linter.RuleEntry<infer Options> ? Options : never;

export type AllRulesWithPrefix<T extends string> = PickKeysStartingWith<AllEslintRules, T>;

export type RuleOverrides<T extends string | RulesRecord> = T extends string
  ? AllRulesWithPrefix<T>
  : T extends RulesRecord
    ? FlatConfigEntry<T>['rules']
    : never;

export type ConfigSharedOptions<T extends string | RulesRecord = RulesRecord> = Partial<
  Pick<FlatConfigEntry, 'files' | 'ignores'> & {
    overrides?: RuleOverrides<T>;
    /** If severity is forced, `errorsInsteadOfWarnings` option will be completely ignored */
    forceSeverity?: Exclude<EslintSeverity, 0 | 'off'>;
  }
>;

/* The following helper type maps an object with rule definitions to rule entries found in config files */

type SingleRuleDefinitionToRuleEntry<T> =
  T extends TSESLint.RuleModule<never, infer Options>
    ? EslintSeverity | [EslintSeverity, Options]
    : never;

export type RuleDefinitionsToRuleEntries<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, TSESLint.RuleModule<never, any>>,
> = {
  [K in keyof T]: SingleRuleDefinitionToRuleEntry<T[K]>;
};

/* Entrypoint options */

export interface EslintConfigUnOptions {
  /**
   * **Global** ignore patterns
   */
  ignores?: FlatConfigEntry['ignores'];

  /**
   * Automatically add gitignore'd files to `ignores` array.
   * @default true if `.gitignore` exists
   */
  gitignore?: boolean | FlatGitignoreOptions;

  /**
   * Enables `eslint-config-prettier` at the end of the ruleset.
   * @see https://github.com/prettier/eslint-config-prettier
   * @default true
   */
  disablePrettierIncompatibleRules?: boolean;

  /**
   * Some rules have "warning" level set by default.
   * - Passing here `true` would change the level to "error" for all such rules.
   * - You can also pass an array with rule names to change their level to "error".
   * - Passing `false` does nothing.
   */
  errorsInsteadOfWarnings?: boolean | string[];

  extraConfigs?: FlatConfigEntry[];

  // TODO note about plugins that can be used in multiple places?
  configs?: {
    /**
     * @default true
     */
    js?: boolean | Partial<JsEslintConfigOptions>;
    /**
     * @default true
     */
    ts?: boolean | Partial<TsEslintConfigOptions>;
    /**
     * @default true
     */
    unicorn?: boolean | Partial<UnicornEslintConfigOptions>;
    /**
     * @default true
     */
    import?: boolean | Partial<ImportEslintConfigOptions>;
    /**
     * @default true
     */
    node?: boolean | Partial<NodeEslintConfigOptions>;
    /**
     * @default true
     */
    promise?: boolean | Partial<PromiseEslintConfigOptions>;
    /**
     * @default true
     */
    sonar?: boolean | Partial<PromiseEslintConfigOptions>;
    /**
     * `false` (do not enable Vue rules) <=> `vue` package is not installed (at any level) or `false` is explicitly passed
     */
    vue?: boolean | Partial<VueEslintConfigOptions>;
    /**
     * `false` (do not enable Tailwind rules) <=> `tailwindcss` package is not installed (at any level) or `false` is explicitly passed
     */
    tailwind?: boolean | Partial<TailwindEslintConfigOptions>;
    /**
     * @default true
     */
    regexp?: boolean | Partial<RegexpEslintConfigOptions>;
    /**
     * NOTE: disabled by default
     * @default false
     */
    security?: boolean | Partial<SecurityEslintConfigOptions>;
    /**
     * NOTE: disabled by default
     * @default false
     */
    preferArrowFunctions?: boolean | Partial<PreferArrowFunctionsEslintConfigOptions>;
    /**
     * NOTE: disabled by default.
     * If enabled, lockfiles (`yarn.lock`, `pnpm-lock.yaml`) will be ignored by default, and that cannot be overridden.
     * @default false
     */
    yaml?: boolean | Partial<YamlEslintConfigOptions>;
  };
}

export interface InternalConfigOptions {
  globalOptions?: Omit<EslintConfigUnOptions, 'configs'>;
  isTypescriptEnabled?: boolean;
  vueOptions?: VueEslintConfigOptions;
}
