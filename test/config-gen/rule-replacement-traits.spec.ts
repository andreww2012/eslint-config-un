import {resolveRuleReplacements} from '../../src/config-un/rule-replacements';
import type {EslintPluginRule} from '../../src/eslint/eslint-utils';
import {ALL_STYLISTIC_RULES, RULES_REQUIRING_TYPE_INFORMATION} from '../../src/plugins.gen';

// The mock factory runs before the imports, so the constants it reads must be hoisted too
const {RULE_NAME} = vi.hoisted(() => ({RULE_NAME: 'no-instanceof-builtins'}) as const);

// A replacement on by default whose rule has other traits than the original one
vi.mock(import('../../src/plugins.gen'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ALL_STYLISTIC_RULES: {
      ...original.ALL_STYLISTIC_RULES,
      unicorn: {...original.ALL_STYLISTIC_RULES['unicorn'], [RULE_NAME]: true as const},
    },
    BUILTIN_RULE_REPLACEMENTS: {
      ...original.BUILTIN_RULE_REPLACEMENTS,
      unicorn: {
        ...original.BUILTIN_RULE_REPLACEMENTS['unicorn'],
        [RULE_NAME]: {
          rule: 'un/vue-no-leading-text-whitespace',
          isOnByDefault: true,
          originalTraits: {},
        },
      },
    },
  };
});

const FULL_RULE_NAME = `unicorn/${RULE_NAME}`;

const RULE: Readonly<EslintPluginRule> = {create: () => ({})};

const isStylistic = (rootOptions: Parameters<typeof resolveRuleReplacements>[0]) =>
  resolveRuleReplacements(rootOptions).ruleTraits.stylistic['unicorn']?.[RULE_NAME];

describe('traits of the replaced rules', () => {
  it('are the generated tables themselves when nothing differs from the defaults', () => {
    const {ruleTraits} = resolveRuleReplacements({});

    expect(ruleTraits.stylistic).toBe(ALL_STYLISTIC_RULES);
    expect(ruleTraits.requiresTypeInfo).toBe(RULES_REQUIRING_TYPE_INFORMATION);
  });

  it('are the ones of the replacing rule by default', () => {
    expect(isStylistic({})).toBe(true);
  });

  it('are restored when the replacement is turned off', () => {
    expect(isStylistic({plugins: {unicorn: {replacements: {[RULE_NAME]: false}}}})).toBeUndefined();
  });

  it('are restored when every replacement of the plugin is turned off', () => {
    expect(isStylistic({plugins: {unicorn: {replacements: false}}})).toBeUndefined();
  });

  it('are restored for a plugin provided via `plugin`', () => {
    expect(isStylistic({plugins: {unicorn: {plugin: {rules: {}}}}})).toBeUndefined();
  });

  it('are the original ones for a rule object', () => {
    expect(isStylistic({plugins: {unicorn: {replacements: {[RULE_NAME]: RULE}}}})).toBeUndefined();
  });

  it('are overridden by `traits`', () => {
    const {ruleTraits} = resolveRuleReplacements({
      plugins: {
        unicorn: {
          replacements: {
            [RULE_NAME]: {
              rule: RULE,
              traits: {requiresTypeInfo: true, autofixDisabled: true, cliFiles: 'off'},
            },
          },
        },
      },
    });

    expect(ruleTraits.requiresTypeInfo['unicorn']?.rules[RULE_NAME]).toBe(true);
    expect(ruleTraits.autofixDisabled[FULL_RULE_NAME]).toBe(true);
    expect(ruleTraits.cliFiles['unicorn']?.[RULE_NAME]).toBe('off');
    // Code blocks never get type information
    expect(ruleTraits.disableInCodeBlocks).toContain(FULL_RULE_NAME);
  });

  it('are removed by `traits`', () => {
    const {ruleTraits} = resolveRuleReplacements({
      plugins: {
        unicorn: {
          replacements: {
            'no-null': {
              rule: RULE,
              traits: {stylistic: false, requiresNetwork: true, disableInTestFiles: true},
            },
          },
        },
      },
    });

    expect(ruleTraits.stylistic['unicorn']).not.toContainKey('no-null');
    expect(ruleTraits.requiresNetwork).toContain('unicorn/no-null');
    expect(ruleTraits.disableInTestFiles).toContain('unicorn/no-null');
  });
});
