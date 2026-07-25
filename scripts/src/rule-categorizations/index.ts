import {e18eRuleCategorization} from './e18e';
import {pnpmRuleCategorization} from './pnpm';
import type {RuleCategorization} from './shared';
import {unicornRuleCategorization} from './unicorn';

/**
 * Rule categorizations per plugin prefix, used to generate `src/eslint-rule-categories.gen.ts`.
 *
 * A plugin needs one only if its Configs split its rules into several Sub-configs
 */
export const RULE_CATEGORIZATIONS: Record<string, RuleCategorization<string>> = {
  e18e: e18eRuleCategorization,
  pnpm: pnpmRuleCategorization,
  unicorn: unicornRuleCategorization,
};
