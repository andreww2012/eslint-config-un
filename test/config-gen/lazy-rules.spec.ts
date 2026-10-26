import type {EslintPlugin, EslintRuleMetaWithLanguages} from '../../src/eslint/eslint-types';
import {mapValues, objectFromKeys} from '../../src/utils';

// Its autofix is disabled by default
const RULE_WITH_AUTOFIX_DISABLED = 'string-check';
const RULE_WITH_AUTOFIX_KEPT = 'other-rule';

/**
 * Defines the rules as getters which record their loading, like typescript-eslint does to only load
 * the rules on first access
 */
const createLazilyLoadedPlugin = () => {
  const loadedRuleNames: string[] = [];
  const rules = objectFromKeys([RULE_WITH_AUTOFIX_DISABLED, RULE_WITH_AUTOFIX_KEPT], () => {
    const meta: EslintRuleMetaWithLanguages = {
      type: 'layout',
      fixable: 'code',
      schema: [],
      languages: ['js/js'],
    };
    return {meta, create: () => ({})};
  });
  const plugin: EslintPlugin = {
    rules: Object.defineProperties(
      {},
      mapValues(rules, (rule, ruleName) => ({
        enumerable: true,
        get: () => {
          loadedRuleNames.push(ruleName);
          return rule;
        },
      })),
    ),
  };
  return {plugin, rules, loadedRuleNames};
};

describe('rules loaded on first access', () => {
  it('are not loaded while generating the config', async () => {
    const {plugin, loadedRuleNames} = createLazilyLoadedPlugin();

    await computeEslintConfig('casePolice', {un: {plugins: {'case-police': {plugin}}}});

    expect(loadedRuleNames).toBeEmpty();
  });

  it('lose `meta.languages` and the disabled autofix once loaded, unlike the original rules', async () => {
    const {plugin, rules, loadedRuleNames} = createLazilyLoadedPlugin();
    const configResult = await computeEslintConfig('casePolice', {
      un: {plugins: {'case-police': {plugin}}},
    });
    const registeredRules = configResult.getLoadedPlugin('case-police')?.rules;

    expect(registeredRules?.[RULE_WITH_AUTOFIX_DISABLED]?.meta).not.toContainAnyKeys([
      'languages',
      'fixable',
    ]);
    expect(registeredRules?.[RULE_WITH_AUTOFIX_KEPT]?.meta).not.toContainKey('languages');
    expect(registeredRules?.[RULE_WITH_AUTOFIX_KEPT]?.meta?.fixable).toBe('code');
    expect(loadedRuleNames).toStrictEqual([RULE_WITH_AUTOFIX_DISABLED, RULE_WITH_AUTOFIX_KEPT]);

    expect(rules[RULE_WITH_AUTOFIX_DISABLED]?.meta).toContainEntries([
      ['fixable', 'code'],
      ['languages', ['js/js']],
    ]);
  });
});

it('disabling autofix leaves the rules of the original plugin intact', async () => {
  const {default: unicornPlugin} = await import('eslint-plugin-unicorn');
  const configResult = await computeEslintConfig('unicorn');

  // Disabled by default
  expect(
    configResult.getLoadedPlugin('unicorn')?.rules?.['no-useless-undefined']?.meta,
  ).not.toContainKey('fixable');
  expect(unicornPlugin.rules?.['no-useless-undefined']?.meta?.fixable).toBe('code');
});
