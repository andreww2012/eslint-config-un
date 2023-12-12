import type {TSESLint} from '@typescript-eslint/utils';
import type Eslint from 'eslint';
import type {ImportEslintConfigOptions} from './configs/import';
import type {JsEslintConfigOptions} from './configs/js';
import type {NodeEslintConfigOptions} from './configs/node';
import type {PromiseEslintConfigOptions} from './configs/promise';
import type {SecurityEslintConfigOptions} from './configs/security';
import type {TailwindEslintConfigOptions} from './configs/tailwind';
import type {TsEslintConfigOptions} from './configs/ts';
import type {UnicornEslintConfigOptions} from './configs/unicorn';
import type {VueEslintConfigOptions} from './configs/vue';

export type RulesRecord = Eslint.Linter.RulesRecord;

export type FlatConfigEntry<T extends RulesRecord = RulesRecord> = Eslint.Linter.FlatConfig<T>;

export type RuleOverrides<T extends string | RulesRecord> = FlatConfigEntry<
  T extends string ? Record<T, Eslint.Linter.RuleEntry> : T
>['rules'];

export type ConfigSharedOptions<T extends string | RulesRecord = RulesRecord> = Partial<
  Pick<
    FlatConfigEntry<T extends string ? Record<T, Eslint.Linter.RuleEntry> : T>,
    'files' | 'ignores'
  > & {
    overrides?: RuleOverrides<T>;
  }
>;

/* The following helper type maps an object with rule definitions to rule entries found in config files */

type SingleRuleDefinitionToRuleEntry<T> =
  T extends TSESLint.RuleModule<never, infer Options>
    ? Eslint.Linter.RuleLevel | [Eslint.Linter.RuleLevel, Options]
    : never;

export type RuleDefinitionsToRuleEntries<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, TSESLint.RuleModule<never, any>>,
> = {
  [K in keyof T]: SingleRuleDefinitionToRuleEntry<T[K]>;
};

/* Entrypoint options */

export interface EslintConfigOptions {
  /**
   * **Global** ignore patterns
   */
  ignores?: FlatConfigEntry['ignores'];

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
    js?: boolean | JsEslintConfigOptions;
    /**
     * @default true
     */
    ts?: boolean | TsEslintConfigOptions;
    /**
     * @default true
     */
    unicorn?: boolean | UnicornEslintConfigOptions;
    /**
     * @default true
     */
    import?: boolean | ImportEslintConfigOptions;
    /**
     * @default true
     */
    node?: boolean | NodeEslintConfigOptions;
    /**
     * @default true
     */
    promise?: boolean | PromiseEslintConfigOptions;
    /**
     * @default true
     */
    sonar?: boolean | PromiseEslintConfigOptions;
    /**
     * `false` (do not enable Vue rules) <=> `vue` package is not installed (at any level) or `false` is explicitly passed
     */
    vue?: boolean | VueEslintConfigOptions;
    /**
     * `false` (do not enable Tailwind rules) <=> `tailwindcss` package is not installed (at any level) or `false` is explicitly passed
     */
    tailwind?: boolean | TailwindEslintConfigOptions;
    /**
     * NOTE: disabled by default
     * @default false
     */
    security?: boolean | SecurityEslintConfigOptions;
  };
}

export interface InternalConfigOptions {
  globalOptions?: EslintConfigOptions;
}
