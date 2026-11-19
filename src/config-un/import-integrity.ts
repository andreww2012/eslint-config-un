import type {ImportIntegrityPluginSettings} from '../configs/import-integrity';
import type {EslintFullRuleName} from '../eslint/eslint-types';
import {BUILTIN_RULE_REPLACEMENTS, type BuiltinReplacedRuleName} from '../plugins.gen';
import {mapValues} from '../utils';
import {type RuleReplacementRequests, toReplacementRequests} from './rule-replacements';
import type {EslintConfigUnOptions} from './shared';

/**
 * The plugin rejects `packageRootDir` in the monorepo form, so it can only be defaulted when the
 * user has not opted into that form
 */
export const withDefaultPackageRootDirectory = (
  settings: ImportIntegrityPluginSettings | undefined,
): ImportIntegrityPluginSettings =>
  settings && 'monorepoRootDir' in settings
    ? settings
    : {packageRootDir: process.cwd(), ...settings};

type RuleNameInPlugin<Name extends EslintFullRuleName, Prefix extends string> =
  Name extends EslintFullRuleName<Prefix, infer RuleName> ? RuleName : never;

/**
 * The `import` rules `useImportIntegrity` can replace
 */
export type ImportPluginReplaceableRules = RuleNameInPlugin<BuiltinReplacedRuleName, 'import'>;

/**
 * Returns the rule replacements `useImportIntegrity` asks for, keyed by the plugin prefix: every
 * built-in replacement of an `import` rule, except the ones `replaceRules` turns off
 */
export const getImportIntegrityRuleReplacements = (
  useImportIntegrity: EslintConfigUnOptions['useImportIntegrity'],
): Partial<Record<string, RuleReplacementRequests>> => {
  if (!useImportIntegrity) {
    return {};
  }

  const replaceRules: Partial<Record<string, boolean>> =
    (typeof useImportIntegrity === 'object' && useImportIntegrity.replaceRules) || {};
  return {
    import: toReplacementRequests(
      mapValues(
        BUILTIN_RULE_REPLACEMENTS['import'] || {},
        (_replacement, ruleName) => replaceRules[ruleName] !== false,
      ),
      'option:useImportIntegrity',
    ),
  };
};
