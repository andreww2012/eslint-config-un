import type {TSESLint} from '@typescript-eslint/utils';
import type Eslint from 'eslint';
import type {VueEslintConfigOptions} from '../configs/vue';
import type {RuleOptions} from '../eslint-types';
import type {EslintConfigUnOptions} from '../index';
import type {
  ConstantKeys,
  PickKeysNotStartingWith,
  PickKeysStartingWith,
  PrettifyShallow,
} from './utils';

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

export interface InternalConfigOptions {
  globalOptions?: Omit<EslintConfigUnOptions, 'configs'>;
  isTypescriptEnabled?: boolean;
  vueOptions?: VueEslintConfigOptions;
}
