import {e18eRuleCategorization} from './e18e';
import {pnpmRuleCategorization} from './pnpm';
import type {RuleCategorization} from './shared';
import {typeAwareRuleCategorization} from './type-aware';
import {unicornRuleCategorization} from './unicorn';

/**
 * Rule categorizations per plugin prefix, used to generate `src/eslint-rule-categories.gen.ts`.
 *
 * A plugin needs one if its Configs split its rules into several Sub-configs, or if a category
 * describes something about the rules themselves, like requiring type information
 */
export const RULE_CATEGORIZATIONS: Record<string, RuleCategorization<string>> = {
  e18e: e18eRuleCategorization,
  'eslint-plugin': typeAwareRuleCategorization,
  'expect-type': typeAwareRuleCategorization,
  jest: typeAwareRuleCategorization,
  ngrx: typeAwareRuleCategorization,
  pnpm: pnpmRuleCategorization,
  ts: typeAwareRuleCategorization,
  unicorn: unicornRuleCategorization,
  vitest: typeAwareRuleCategorization,
};
