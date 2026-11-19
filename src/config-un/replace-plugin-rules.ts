// This file must not import the generated files, even through another file: `scripts/prep.ts`
// uses it to create them

import ourPackageJson from '../../package.json' with {type: 'json'};
import type {EslintPlugin} from '../eslint/eslint-types';
import type {EslintPluginRule} from '../eslint/eslint-utils';
import {once} from '../utils';

/**
 * The documentation link of every rule that is put in place of another one by a built-in
 * replacement
 */
export const BUILTIN_RULE_REPLACEMENTS_DOCS_URL = `${ourPackageJson.homepage}#built-in-replacements`;

/**
 * Added to the end of the version of a plugin whose rules were replaced, followed by the list of
 * the replacements: `63.0.0+rule-replacements@1.0.0:no-null=my-plugin/no-null`
 */
export const RULE_REPLACEMENTS_VERSION_SUFFIX = `+rule-replacements@${ourPackageJson.version}`;

/**
 * A rule of a plugin to replace, and the rule that replaces it
 */
export interface RuleReplacementToApply {
  /**
   * The name of the replaced rule, without the plugin prefix
   */
  ruleName: string;

  /**
   * The full name of the replacing rule, when it is given by name
   */
  sourceName?: string;

  /**
   * Returns the replacing rule.
   * Called when the replaced rule is first read, so that a lazily loaded rule stays lazy
   */
  getRule: () => EslintPluginRule | undefined;

  /**
   * The documentation link the replacing rule gets instead of its own
   */
  docsUrl?: string;
}

/**
 * Returns the label of a replacement, used in the plugin version and the debug output:
 * `no-null=my-plugin/no-null`, or the rule name alone when the replacing rule has no name
 */
export const describeRuleReplacement = ({
  ruleName,
  sourceName,
}: Pick<RuleReplacementToApply, 'ruleName' | 'sourceName'>) =>
  sourceName ? `${ruleName}=${sourceName}` : ruleName;

const isSchemaEmpty = (schema: unknown) =>
  schema == null || (Array.isArray(schema) && schema.length === 0);

const finalizeReplacementRule = (rule: EslintPluginRule, docsUrl: string | undefined) => ({
  ...rule,
  meta: {
    ...rule.meta,
    ...(docsUrl && {docs: {...rule.meta?.docs, url: docsUrl}}),
    // The rule may get the options of the rule it replaces, which it then simply ignores
    schema: isSchemaEmpty(rule.meta?.schema) ? false : rule.meta?.schema,
  },
});

/**
 * Returns a copy of the plugin with the given rules replaced, and with a version that lists the
 * replacements
 */
export const withReplacedRules = <Plugin extends EslintPlugin>(
  plugin: Plugin,
  replacements: readonly RuleReplacementToApply[],
): Plugin => {
  const descriptors: PropertyDescriptorMap = Object.getOwnPropertyDescriptors(plugin.rules || {});
  replacements.forEach(({ruleName, getRule, docsUrl}) => {
    descriptors[ruleName] = {
      enumerable: true,
      configurable: true,
      get: once(() => {
        const rule = getRule();
        return rule && finalizeReplacementRule(rule, docsUrl);
      }),
    };
  });
  return {
    ...plugin,
    meta: {
      ...plugin.meta,
      // The name and the version of a plugin are all the cache of ESLint (`--cache`) knows about
      // it. With the version left as it is, ESLint would keep the results the original rules gave
      version: `${plugin.meta?.version || ''}${RULE_REPLACEMENTS_VERSION_SUFFIX}:${replacements.map((replacement) => describeRuleReplacement(replacement)).join(',')}`,
    },
    rules: Object.defineProperties({}, descriptors),
  };
};
