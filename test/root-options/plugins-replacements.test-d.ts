import type {TSESLint} from '@typescript-eslint/utils';
import type {JSRuleDefinition, Rule} from 'eslint';
import type {RuleReplacementTraits} from '../../src/config-un/rule-replacement-types';
import {defineRuleReplacements, eslintConfig} from '../../src/index';

declare const coreTypedRule: JSRuleDefinition<{RuleOptions: [{extra?: number}]}>;
declare const tsEslintTypedRule: TSESLint.RuleModule<'message', [{foo?: string}]>;
declare const untypedRule: Rule.RuleModule;
declare const extraPlugin: {rules: {'my-rule': Rule.RuleModule}};

const RULE_WITH_SCHEMA = {
  meta: {
    schema: [
      {
        type: 'object',
        properties: {mode: {enum: ['strict', 'loose']}},
        additionalProperties: false,
      },
    ],
  },
  create: () => ({}),
} as const;

describe('option: `plugins.<pluginName>.replacements` (type level)', () => {
  describe('by default', () => {
    it('types the options of a rule replaced by default after the replacing rule', () => {
      void eslintConfig({
        configs: {unicorn: {overrides: {'unicorn/no-array-sort': [2, {unneededCopies: 'allow'}]}}},
      });

      void eslintConfig({
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [
                2,
                {
                  // @ts-expect-error Only the original rule has this option
                  allowExpressionStatement: false,
                },
              ],
            },
          },
        },
      });
    });
  });

  describe('turning replacements off', () => {
    it('brings back the options of the original rule for `false`', () => {
      void eslintConfig({
        plugins: {unicorn: {replacements: {'no-array-sort': false}}},
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [2, {allowExpressionStatement: false}],
              'unicorn/no-array-reverse': [2, {unneededCopies: 'allow'}],
            },
          },
        },
      });
    });

    it('brings back the options of every original rule of the plugin for `false`', () => {
      void eslintConfig({
        plugins: {unicorn: {replacements: false}},
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [2, {allowExpressionStatement: false}],
              'unicorn/no-array-reverse': [2, {allowExpressionStatement: false}],
            },
          },
        },
      });
    });
  });

  describe('replacing rules', () => {
    it('types the options after the source of each form', () => {
      void eslintConfig({
        extraPlugins: {extra: extraPlugin},
        plugins: {
          regexp: {settings: {allowedCharacterRanges: 'all'}},
          'eslint-react': {prefix: 'react-x'},
          unicorn: {
            replacements: {
              'no-null': RULE_WITH_SCHEMA,
              'no-for-loop': untypedRule,
              'prefer-includes': tsEslintTypedRule,
              'no-nested-ternary': {rule: 'extra/my-rule', dropOptionsSetByConfigs: true},
              'prefer-at': {rule: 'ts/array-type', traits: {stylistic: true, cliFiles: null}},
            },
          },
          import: {replacements: {'no-cycle': () => Promise.resolve(coreTypedRule)}},
        },
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-null': [2, {mode: 'strict'}],
              'unicorn/no-for-loop': [2, {anything: true}],
              'unicorn/prefer-includes': [2, {foo: 'bar'}],
              'unicorn/no-nested-ternary': [2, 'anything'],
              'unicorn/prefer-at': [2, {default: 'generic'}],
              'unicorn/no-array-splice': 2,
            },
          },
          import: {overrides: {'import/no-cycle': [2, {extra: 1}]}},
        },
      });
    });

    it('rejects the options the replacing rule does not take', () => {
      void eslintConfig({
        plugins: {
          unicorn: {replacements: {'no-null': RULE_WITH_SCHEMA}},
          import: {replacements: {'no-cycle': coreTypedRule}},
        },
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-null': [
                2,
                {
                  // @ts-expect-error Not a member of the enum
                  mode: 'other',
                },
              ],
            },
          },
          import: {
            overrides: {
              'import/no-cycle': [
                2,
                {
                  // @ts-expect-error The options of the original rule are gone
                  maxDepth: 1,
                },
              ],
            },
          },
        },
      });
    });

    it('takes the original options of a source replaced by default itself', () => {
      void eslintConfig({
        plugins: {unicorn: {replacements: {'no-array-reverse': 'unicorn/no-array-sort'}}},
        configs: {
          unicorn: {
            overrides: {'unicorn/no-array-reverse': [2, {allowExpressionStatement: false}]},
          },
        },
      });
    });

    it('applies to `overridesAny`, `extraConfigs` and the nested Sub-configs', () => {
      void eslintConfig({
        plugins: {ts: {replacements: {'array-type': coreTypedRule}}},
        configs: {
          js: {overridesAny: {'ts/array-type': [2, {extra: 1}]}},
          ts: {configTypeAware: {overridesAny: {'ts/array-type': [2, {extra: 1}]}}},
        },
        extraConfigs: [{rules: {'ts/array-type': [2, {extra: 1}]}}],
      });

      void eslintConfig({
        plugins: {ts: {replacements: {'array-type': coreTypedRule}}},
        extraConfigs: [
          {
            rules: {
              'ts/array-type': [
                2,
                {
                  // @ts-expect-error The options of the original rule are gone
                  default: 'generic',
                },
              ],
            },
          },
        ],
      });
    });

    it('combines with `noWarnings`', () => {
      void eslintConfig({
        noWarnings: true,
        plugins: {import: {replacements: {'no-cycle': coreTypedRule}}},
        configs: {import: {overrides: {'import/no-cycle': [2, {extra: 1}]}}},
      });

      void eslintConfig({
        noWarnings: true,
        plugins: {import: {replacements: {'no-cycle': coreTypedRule}}},
        configs: {
          import: {
            overrides: {
              // @ts-expect-error `warn` is forbidden by `noWarnings`
              'import/no-cycle': ['warn', {extra: 1}],
            },
          },
        },
      });
    });
  });

  describe('`traits`', () => {
    it('removes a trait with `false`, or with `null` when it only has other values', () => {
      expectTypeOf<RuleReplacementTraits['stylistic']>().toEqualTypeOf<boolean | undefined>();
      expectTypeOf<RuleReplacementTraits['requiresTypeInfo']>().toEqualTypeOf<
        boolean | 'optional' | undefined
      >();
      expectTypeOf<RuleReplacementTraits['disableInCodeBlocks']>().toEqualTypeOf<
        boolean | undefined
      >();
      expectTypeOf<RuleReplacementTraits['cliFiles']>().toEqualTypeOf<
        'off' | 'error' | null | undefined
      >();
    });
  });

  describe('mistakes', () => {
    it('rejects an unknown rule', () => {
      void eslintConfig({
        plugins: {
          unicorn: {
            replacements: {
              // @ts-expect-error Not a rule of the plugin
              'not-a-rule': untypedRule,
            },
          },
        },
      });
    });

    it('rejects a value that is not a rule', () => {
      void eslintConfig({
        plugins: {
          unicorn: {
            replacements: {
              // @ts-expect-error Not a rule at all
              'no-null': 42,
            },
          },
        },
      });
    });

    it('reports the untyped parameter of a function written in place', () => {
      void eslintConfig({
        plugins: {
          unicorn: {
            replacements: {
              'no-array-sort': 'un/no-array-sort',
              'no-for-loop': (
                // @ts-expect-error The parameter is not typed from the context
                original,
              ) =>
                // eslint-disable-next-line ts/no-unsafe-return -- The parameter is untyped on purpose
                ({...original}),
            },
          },
        },
      });
    });

    it('rejects a typo in the other options of the plugin', () => {
      void eslintConfig({
        plugins: {
          unicorn: {
            // @ts-expect-error A typo in the option name
            prefx: 'u',
          },
        },
      });
    });

    it('rejects an unknown source rule name', () => {
      void eslintConfig({
        plugins: {
          unicorn: {
            replacements: {
              // @ts-expect-error A typo in the rule name
              'no-null': 'un/no-arrray-sort',
            },
          },
        },
      });
    });
  });

  describe('`Parameters<typeof eslintConfig>`', () => {
    type Options = Parameters<typeof eslintConfig>[0];

    it('is the type of the options', () => {
      expectTypeOf<Options>().not.toBeNever();

      const options: Options = {configs: {unicorn: true}, plugins: {unicorn: {prefix: 'u'}}};
      const createConfig = (optionsToPass: Options) => eslintConfig(optionsToPass);

      void createConfig(options);
    });

    it('rejects a typo in the options of a plugin', () => {
      const options: Options = {
        plugins: {
          unicorn: {
            // @ts-expect-error A typo in the option name
            prefx: 'u',
          },
        },
      };

      expectTypeOf(options).not.toBeNever();
    });

    it('knows the rules of the plugin, which is what an editor completes from', () => {
      const options: Options = {
        plugins: {
          unicorn: {
            replacements: {
              'no-null': untypedRule,
              // @ts-expect-error Not a rule of the plugin
              'not-a-rule': untypedRule,
            },
          },
        },
      };

      expectTypeOf(options).not.toBeNever();
    });
  });

  describe('`defineRuleReplacements`', () => {
    const unicornReplacements = defineRuleReplacements('unicorn', {
      'no-array-sort': 'un/no-array-sort',
      'no-for-loop': (original) => ({...original}),
      'no-null': {
        meta: RULE_WITH_SCHEMA.meta,
        create: () => ({}),
      },
    });

    it('types the parameters of the functions', () => {
      void eslintConfig({
        plugins: {unicorn: {replacements: unicornReplacements}},
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [2, {unneededCopies: 'allow'}],
              'unicorn/no-null': [2, {mode: 'loose'}],
              'unicorn/no-for-loop': 2,
            },
          },
        },
      });

      void eslintConfig({
        plugins: {unicorn: {replacements: unicornReplacements}},
        configs: {
          unicorn: {
            overrides: {
              // @ts-expect-error The wrapper keeps the options of the original, which has none
              'unicorn/no-for-loop': [2, {anything: 1}],
            },
          },
        },
      });
    });

    it('types a wrapper of a rule replaced by default after the original rule', () => {
      const wrappers = defineRuleReplacements('unicorn', {
        'no-array-sort': (original) => ({...original}),
        'no-array-reverse': {rule: (original) => ({...original})},
      });

      void eslintConfig({
        plugins: {unicorn: {replacements: wrappers}},
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [2, {allowExpressionStatement: false}],
              'unicorn/no-array-reverse': [2, {allowExpressionStatement: false}],
            },
          },
        },
      });

      void eslintConfig({
        plugins: {unicorn: {replacements: wrappers}},
        configs: {
          unicorn: {
            overrides: {
              'unicorn/no-array-sort': [
                2,
                {
                  // @ts-expect-error Only the rule replacing the original one by default has this option
                  unneededCopies: 'allow',
                },
              ],
              'unicorn/no-array-reverse': [
                2,
                {
                  // @ts-expect-error Same as above
                  unneededCopies: 'allow',
                },
              ],
            },
          },
        },
      });
    });

    it('rejects its result under another plugin', () => {
      void eslintConfig({
        plugins: {
          // @ts-expect-error Not the rules of this plugin
          import: {replacements: unicornReplacements},
        },
      });
    });

    it('rejects an unknown rule', () => {
      void defineRuleReplacements('unicorn', {
        // @ts-expect-error Not a rule of the plugin
        'not-a-rule': untypedRule,
      });
    });
  });
});
