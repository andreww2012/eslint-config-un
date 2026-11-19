import {BUILTIN_RULE_REPLACEMENTS_DOCS_URL} from '../../src/config-un/replace-plugin-rules';
import type {EslintPlugin} from '../../src/eslint/eslint-types';

/**
 * Returns the given rules of the plugin that a built-in replacement implements.
 * A replacing rule keeps the name of the rule it replaces, so the two are told apart by the
 * documentation link
 */
export const filterRulesReplacedByBuiltins = <RuleName extends string>(
  plugin: EslintPlugin | undefined,
  ruleNames: readonly RuleName[],
) =>
  ruleNames.filter(
    (ruleName) => plugin?.rules?.[ruleName]?.meta?.docs?.url === BUILTIN_RULE_REPLACEMENTS_DOCS_URL,
  );
