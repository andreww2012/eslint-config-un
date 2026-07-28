import {createDocsCategoryCategorization} from './docs-category';
import {e18eRuleCategorization} from './e18e';
import {pnpmRuleCategorization} from './pnpm';
import type {PluginRuleCategorizations} from './shared';
import {typeAwareRuleCategorization} from './type-aware';
import {unicornRuleCategorization} from './unicorn';

/**
 * Rule categorizations per plugin prefix, used to generate `src/eslint-rule-categories.gen.ts`.
 *
 * A plugin needs one if its Configs split its rules into several Sub-configs, or if a category
 * describes something about the rules themselves, like requiring type information
 */
export const RULE_CATEGORIZATIONS: Record<string, PluginRuleCategorizations> = {
  e18e: e18eRuleCategorization,
  ember: createDocsCategoryCategorization('testing', 'Testing', {
    rulesToExclude: [
      'no-test-support-import', // Bans importing test support code *from production code*, so it must not be limited to tests
    ],
  }),
  'eslint-plugin': [
    createDocsCategoryCategorization('tests', 'Tests'),
    typeAwareRuleCategorization,
  ],
  'expect-type': typeAwareRuleCategorization,
  jest: typeAwareRuleCategorization,
  ngrx: typeAwareRuleCategorization,
  pnpm: pnpmRuleCategorization,
  svelte: createDocsCategoryCategorization('system', 'System'),
  ts: typeAwareRuleCategorization,
  unicorn: unicornRuleCategorization,
  vitest: typeAwareRuleCategorization,
};
