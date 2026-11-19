import ourPackageJson from '../../package.json' with {type: 'json'};
import {
  BUILTIN_RULE_REPLACEMENTS_DOCS_URL,
  RULE_REPLACEMENTS_VERSION_SUFFIX,
} from '../../src/config-un/replace-plugin-rules';
import type {EslintPlugin} from '../../src/eslint/eslint-types';
import type {EslintPluginRule} from '../../src/eslint/eslint-utils';
import {mapValues, objectFromKeys} from '../../src/utils';
import {getLoadedPluginsWithExtraPlugins} from '../helpers/extra-plugins';
import {filterRulesReplacedByBuiltins} from '../helpers/rule-replacements';

type UnOption = (Parameters<typeof computeEslintConfig>[1] & {})['un'];

const REPLACED_BY_DEFAULT = ['no-array-reverse', 'no-array-sort', 'no-array-splice'] as const;

const UNICORN_REPLACEMENTS_OFF = {unicorn: {replacements: false}} as const;

const createRule = (
  description: string,
  meta: EslintPluginRule['meta'] = {},
): EslintPluginRule => ({
  meta: {type: 'problem', ...meta, docs: {description}},
  create: () => ({}),
});

const RULE_WITHOUT_SCHEMA_DESCRIPTION = 'Rule without schema';
const RULE_WITHOUT_SCHEMA: Readonly<EslintPluginRule> = createRule(RULE_WITHOUT_SCHEMA_DESCRIPTION);

const FIXABLE_RULE_DESCRIPTION = 'Fixable rule';
const FIXABLE_RULE: Readonly<EslintPluginRule> = createRule(FIXABLE_RULE_DESCRIPTION, {
  fixable: 'code',
});

const computeUnicornConfig = (un?: UnOption) => computeEslintConfig('unicorn', {un});

const getUnicornRule = async (ruleName: string, un?: UnOption) =>
  (await computeUnicornConfig(un)).getLoadedPlugin('unicorn')?.rules?.[ruleName];

const getReplacedUnicornRule = (
  ruleName: string,
  replacement: string | EslintPluginRule | ((original: EslintPluginRule) => EslintPluginRule),
) => getUnicornRule(ruleName, {plugins: {unicorn: {replacements: {[ruleName]: replacement}}}});

const getUnicornRulesReplacedByDefault = async (un?: UnOption) =>
  filterRulesReplacedByBuiltins(
    (await computeUnicornConfig(un)).getLoadedPlugin('unicorn'),
    REPLACED_BY_DEFAULT,
  );

/**
 * Defines the rules as getters which record their loading, like `typescript-eslint` does
 */
const createLazilyLoadedPlugin = (ruleNames: readonly string[]) => {
  const loadedRuleNames: string[] = [];
  const rules = objectFromKeys(ruleNames, (ruleName) => createRule(ruleName));
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
  return {plugin, loadedRuleNames};
};

describe('option: `plugins.<pluginName>.replacements`', () => {
  describe('built-in replacements', () => {
    it('replace the rules that are replaced by default and load the plugin of the replacing rules', async () => {
      const configResult = await computeUnicornConfig();

      await expect(getUnicornRulesReplacedByDefault()).resolves.toStrictEqual(REPLACED_BY_DEFAULT);
      expect(configResult.getLoadedPlugin('un')).toBeDefined();
    });

    it('use the replacing rule with its own schema', async () => {
      const {default: unPlugin} = await import('../../src/plugin-un');

      await expect(getUnicornRule('no-array-sort')).resolves.toMatchObject({
        meta: {schema: unPlugin.rules?.['no-array-sort']?.meta?.schema},
      });
    });

    it('are all turned off by `false`', async () => {
      await expect(
        getUnicornRulesReplacedByDefault({plugins: UNICORN_REPLACEMENTS_OFF}),
      ).resolves.toStrictEqual([]);
    });

    it('are kept by `true`', async () => {
      await expect(
        getUnicornRulesReplacedByDefault({plugins: {unicorn: {replacements: true}}}),
      ).resolves.toStrictEqual(REPLACED_BY_DEFAULT);
    });

    it('are turned off one by one by `false`', async () => {
      await expect(
        getUnicornRulesReplacedByDefault({
          plugins: {unicorn: {replacements: {'no-array-sort': false}}},
        }),
      ).resolves.toStrictEqual(
        REPLACED_BY_DEFAULT.filter((ruleName) => ruleName !== 'no-array-sort'),
      );
    });

    it('do not load the plugin of the replacing rules when none is applied', async () => {
      const configResult = await computeUnicornConfig({plugins: UNICORN_REPLACEMENTS_OFF});

      expect(configResult.getLoadedPlugin('un')).toBeUndefined();
    });

    it('are not applied to a plugin provided via `plugin` unless asked for', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');

      await expect(
        getUnicornRulesReplacedByDefault({plugins: {unicorn: {plugin: unicornPlugin}}}),
      ).resolves.toStrictEqual([]);
      await expect(
        getUnicornRulesReplacedByDefault({
          plugins: {unicorn: {plugin: unicornPlugin, replacements: {'no-array-sort': true}}},
        }),
      ).resolves.toStrictEqual(['no-array-sort']);
    });

    it('turn on the replacements that are off by default with `true`, with the settings of the plugin of the replacing rule', async () => {
      const configResult = await computeEslintConfig('import', {
        un: {plugins: {import: {replacements: {'no-cycle': true}}}},
      });

      expect(configResult.getLoadedPlugin('import')?.rules?.['no-cycle']?.meta?.docs?.url).toBe(
        BUILTIN_RULE_REPLACEMENTS_DOCS_URL,
      );
      expect(configResult.getLoadedPlugin('import-integrity')).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('global-setup/import-integrity')?.settings?.[
          'import-integrity'
        ],
      ).toStrictEqual({packageRootDir: process.cwd()});
    });

    it('win over `useImportIntegrity`', async () => {
      const configResult = await computeEslintConfig('import', {
        un: {useImportIntegrity: true, plugins: {import: {replacements: false}}},
      });

      expect(configResult.getLoadedPlugin('import')?.rules?.['no-cycle']?.meta?.docs?.url).not.toBe(
        BUILTIN_RULE_REPLACEMENTS_DOCS_URL,
      );
      expect(configResult.getLoadedPlugin('import-integrity')).toBeUndefined();
    });
  });

  describe('replacing rules', () => {
    const WRAPPED_RULE_DESCRIPTION = 'Wrapped';

    it('accepts the name of another rule, which is the rule of its own plugin, never a replaced one', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');
      const rules = (
        await computeUnicornConfig({
          plugins: {unicorn: {replacements: {'no-null': 'unicorn/no-array-sort'}}},
        })
      ).getLoadedPlugin('unicorn')?.rules;

      expect(rules?.['no-null']?.meta?.docs?.description).toBe(
        unicornPlugin.rules?.['no-array-sort']?.meta?.docs?.description,
      );
      expect(rules?.['no-null']?.meta?.docs?.url).not.toBe(BUILTIN_RULE_REPLACEMENTS_DOCS_URL);
    });

    it('loads the plugin of a rule given by name', async () => {
      const configResult = await computeUnicornConfig({
        plugins: {unicorn: {replacements: {'no-null': 'regexp/no-useless-flag'}}},
      });

      expect(configResult.getLoadedPlugin('regexp')).toBeDefined();
    });

    describe('a rule of an extra plugin', () => {
      const EXTRA_RULE_DESCRIPTION = 'Extra rule';

      const getReplacedRule = async (shouldLoadPluginsOnDemand?: boolean) =>
        (
          await getLoadedPluginsWithExtraPlugins({
            configs: {unicorn: true},
            loadPluginsOnDemand: shouldLoadPluginsOnDemand,
            extraPlugins: {extra: {rules: {'extra-rule': createRule(EXTRA_RULE_DESCRIPTION)}}},
            plugins: {unicorn: {replacements: {'no-null': 'extra/extra-rule'}}},
          })
        )['unicorn']?.rules?.['no-null'];

      it('is accepted', async () => {
        await expect(getReplacedRule()).resolves.toMatchObject({
          meta: {docs: {description: EXTRA_RULE_DESCRIPTION}},
        });
      });

      it('is accepted when every loadable plugin is loaded', async () => {
        await expect(getReplacedRule(false)).resolves.toMatchObject({
          meta: {docs: {description: EXTRA_RULE_DESCRIPTION}},
        });
      });
    });

    it('accepts a rule object, which then takes any options when it declares none', async () => {
      await expect(
        getUnicornRule('no-null', {
          plugins: {unicorn: {replacements: {'no-null': RULE_WITHOUT_SCHEMA}}},
        }),
      ).resolves.toMatchObject({
        meta: {docs: {description: RULE_WITHOUT_SCHEMA_DESCRIPTION}, schema: false},
      });
    });

    it('accepts a function loading the rule, which is only called when the plugin is used', async () => {
      const loadRule = vi.fn<() => Promise<EslintPluginRule>>(() =>
        Promise.resolve(RULE_WITHOUT_SCHEMA),
      );

      await computeEslintConfig('js', {
        un: {plugins: {unicorn: {replacements: {'no-null': loadRule}}}},
      });

      expect(loadRule).not.toHaveBeenCalled();

      await expect(
        getUnicornRule('no-null', {plugins: {unicorn: {replacements: {'no-null': loadRule}}}}),
      ).resolves.toMatchObject({meta: {docs: {description: RULE_WITHOUT_SCHEMA_DESCRIPTION}}});
      expect(loadRule).toHaveBeenCalledExactlyOnceWith();
    });

    it('passes the rule of the plugin itself to a function declaring a parameter', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');
      const wrapRule = vi.fn<(original: EslintPluginRule) => EslintPluginRule>((original) => ({
        ...original,
        meta: {...original.meta, docs: {description: WRAPPED_RULE_DESCRIPTION}},
      }));

      await expect(
        getUnicornRule('no-null', {plugins: {unicorn: {replacements: {'no-null': wrapRule}}}}),
      ).resolves.toMatchObject({meta: {docs: {description: WRAPPED_RULE_DESCRIPTION}}});
      expect(wrapRule.mock.calls[0]?.[0].create).toBe(unicornPlugin.rules?.['no-null']?.create);
    });

    it('awaits a function declaring a parameter', async () => {
      await expect(
        getUnicornRule('no-null', {
          plugins: {
            unicorn: {
              replacements: {
                'no-null': async (original: EslintPluginRule) => {
                  await Promise.resolve();
                  return {
                    ...original,
                    meta: {...original.meta, docs: {description: WRAPPED_RULE_DESCRIPTION}},
                  };
                },
              },
            },
          },
        }),
      ).resolves.toMatchObject({meta: {docs: {description: WRAPPED_RULE_DESCRIPTION}}});
    });

    it('accepts the object form', async () => {
      await expect(
        getUnicornRule('no-null', {
          plugins: {unicorn: {replacements: {'no-null': {rule: RULE_WITHOUT_SCHEMA}}}},
        }),
      ).resolves.toMatchObject({meta: {docs: {description: RULE_WITHOUT_SCHEMA_DESCRIPTION}}});
    });

    it('keeps the rules loaded on first access lazy', async () => {
      const target = createLazilyLoadedPlugin(['string-check', 'other-rule']);
      const source = createLazilyLoadedPlugin(['source-rule']);

      const plugins = await getLoadedPluginsWithExtraPlugins({
        configs: {casePolice: true},
        extraPlugins: {source: source.plugin},
        plugins: {
          'case-police': {
            plugin: target.plugin,
            replacements: {'string-check': 'source/source-rule'},
          },
        },
      });

      expect(target.loadedRuleNames).toBeEmpty();
      expect(source.loadedRuleNames).toBeEmpty();

      expect(plugins['case-police']?.rules?.['string-check']?.meta?.docs?.description).toBe(
        'source-rule',
      );
      expect(target.loadedRuleNames).toBeEmpty();
      expect(source.loadedRuleNames).toStrictEqual(['source-rule']);
    });

    it('does not load the replaced rules unless a function declares a parameter', async () => {
      const REPLACED_RULE_NAMES = ['by-loader', 'by-object', 'by-name'] as const;
      const target = createLazilyLoadedPlugin(['string-check', ...REPLACED_RULE_NAMES]);

      const rules = (
        await computeEslintConfig('casePolice', {
          un: {
            plugins: {
              'case-police': {
                plugin: target.plugin,
                replacements: {
                  'by-loader': () => Promise.resolve(RULE_WITHOUT_SCHEMA),
                  'by-object': RULE_WITHOUT_SCHEMA,
                  'by-name': 'un/no-type-assertion',
                },
              },
            },
          },
        })
      ).getLoadedPlugin('case-police')?.rules;

      expect(REPLACED_RULE_NAMES.map((ruleName) => rules?.[ruleName]?.meta)).not.toContain(
        undefined,
      );
      expect(target.loadedRuleNames).toBeEmpty();
    });

    it('keeps the original rule when the replacing one does not exist', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');

      const plugins = await getLoadedPluginsWithExtraPlugins({
        configs: {unicorn: true},
        extraPlugins: {extra: {rules: {}}},
        plugins: {unicorn: {replacements: {'no-null': 'extra/missing-rule'}}},
      });

      expect(plugins['unicorn']?.rules?.['no-null']).toMatchObject({
        meta: {docs: unicornPlugin.rules?.['no-null']?.meta?.docs},
      });
    });
  });

  describe('patched plugin', () => {
    it('gets a version telling the replacements apart', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');
      const configResult = await computeUnicornConfig({
        plugins: {unicorn: {replacements: {'no-null': RULE_WITHOUT_SCHEMA}}},
      });

      expect(configResult.getLoadedPlugin('unicorn')?.meta?.version).toBe(
        `${unicornPlugin.meta?.version}${RULE_REPLACEMENTS_VERSION_SUFFIX}:${REPLACED_BY_DEFAULT.map((ruleName) => `${ruleName}=un/${ruleName}`).join(',')},no-null`,
      );
    });

    it('is not patched when nothing is replaced', async () => {
      const {default: unicornPlugin} = await import('eslint-plugin-unicorn');
      const configResult = await computeUnicornConfig({plugins: UNICORN_REPLACEMENTS_OFF});

      expect(configResult.getLoadedPlugin('unicorn')?.meta?.version).toBe(
        unicornPlugin.meta?.version,
      );
    });

    it('has the replacing rules wrapped by the global autofix removal', async () => {
      const rule = await getUnicornRule('no-null', {
        plugins: {
          unicorn: {
            replacements: {'no-null': {rule: FIXABLE_RULE, traits: {autofixDisabled: true}}},
          },
        },
      });

      expect(rule?.meta?.docs?.description).toBe(FIXABLE_RULE_DESCRIPTION);
      expect(rule?.meta).not.toContainKey('fixable');
    });

    it('has the replacing rules copied with the `disable-autofix` prefix', async () => {
      const configResult = await computeEslintConfig({
        unicorn: {overrides: {'unicorn/no-array-sort': {severity: 2, disableAutofix: true}}},
      });

      expect(
        configResult.getConfigByUnPostfix('global-setup/plugins')?.plugins?.['disable-autofix']
          ?.rules?.['unicorn/no-array-sort']?.meta?.docs?.url,
      ).toBe(BUILTIN_RULE_REPLACEMENTS_DOCS_URL);
    });
  });

  describe('option: `dropOptionsSetByConfigs`', () => {
    const NO_UNRESOLVED_REPLACEMENT = {rule: 'import-integrity/no-unresolved-imports'} as const;
    const PLUGINS_DROPPING_OPTIONS_SET_BY_CONFIGS = {
      import: {
        replacements: {
          'no-unresolved': {...NO_UNRESOLVED_REPLACEMENT, dropOptionsSetByConfigs: true},
        },
      },
    } as const;

    it('keeps the options our Configs pass by default', async () => {
      const configResult = await computeEslintConfig('import', {
        un: {plugins: {import: {replacements: {'no-unresolved': NO_UNRESOLVED_REPLACEMENT}}}},
      });

      expect(configResult.getRuleEntryOptions('import', 'import/no-unresolved')).not.toBeEmpty();
    });

    it('drops the options our Configs pass when option is `true`', async () => {
      const configResult = await computeEslintConfig('import', {
        un: {plugins: PLUGINS_DROPPING_OPTIONS_SET_BY_CONFIGS},
      });

      expect(configResult.getRuleEntry('import', 'import/no-unresolved')).toBe(2);
    });

    it('keeps the options from `overrides` when option is `true`', async () => {
      const OPTIONS = [{caseSensitive: true}] as const;

      const configResult = await computeEslintConfig(
        {import: {overrides: {'import/no-unresolved': [2, ...OPTIONS]}}},
        {un: {plugins: PLUGINS_DROPPING_OPTIONS_SET_BY_CONFIGS}},
      );

      expect(configResult.getRuleEntryOptions('import', 'import/no-unresolved')).toStrictEqual(
        OPTIONS,
      );
    });
  });

  describe('traits', () => {
    const RULE_WITHOUT_TRAITS = 'no-instanceof-builtins';
    const CONFIGS_WITH_NO_STYLISTIC_RULES = {unicorn: true, noStylisticRules: true} as const;

    it('come from a built-in rule given by name', async () => {
      const configResult = await computeEslintConfig(CONFIGS_WITH_NO_STYLISTIC_RULES, {
        un: {
          plugins: {
            unicorn: {
              replacements: {[RULE_WITHOUT_TRAITS]: 'un/vue-no-leading-text-whitespace'},
            },
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('no-stylistic-rules', `unicorn/${RULE_WITHOUT_TRAITS}`),
      ).toBe(0);
    });

    it('stay the ones of the replaced rule for a rule object', async () => {
      const configResult = await computeEslintConfig(CONFIGS_WITH_NO_STYLISTIC_RULES, {
        un: {plugins: {unicorn: {replacements: {'no-null': RULE_WITHOUT_SCHEMA}}}},
      });

      expect(configResult.getRuleEntrySeverity('no-stylistic-rules', 'unicorn/no-null')).toBe(0);
    });

    it('are overridden by `traits`', async () => {
      const configResult = await computeEslintConfig(CONFIGS_WITH_NO_STYLISTIC_RULES, {
        un: {
          plugins: {
            unicorn: {
              replacements: {
                'no-null': {rule: RULE_WITHOUT_SCHEMA, traits: {stylistic: false}},
                [RULE_WITHOUT_TRAITS]: {rule: RULE_WITHOUT_SCHEMA, traits: {stylistic: true}},
              },
            },
          },
        },
      });

      expect(configResult.getRuleSeverities('no-stylistic-rules')).toMatchObject({
        [`unicorn/${RULE_WITHOUT_TRAITS}`]: 0,
      });
      expect(configResult.getRuleSeverities('no-stylistic-rules')).not.toContainKey(
        'unicorn/no-null',
      );
    });

    it('turn off a rule of any plugin made incompatible with Prettier', async () => {
      const configResult = await computeEslintConfig(
        {regexp: true, noPrettierIncompatibleRules: true},
        {
          un: {
            plugins: {
              regexp: {
                replacements: {
                  'no-useless-flag': {
                    rule: RULE_WITHOUT_SCHEMA,
                    traits: {prettierIncompatible: true},
                  },
                },
              },
            },
          },
        },
      );

      expect(
        configResult.getRuleEntrySeverity(
          'no-prettier-incompatible-rules',
          'regexp/no-useless-flag',
        ),
      ).toBe(0);
    });
  });

  describe('an autofix disabled by default', () => {
    const RULE_WITH_AUTOFIX_DISABLED = 'prefer-at';
    // Fixable, and its autofix is not disabled
    const RULE_WITH_AUTOFIX = 'no-instanceof-builtins';

    it('is not kept for a rule object', async () => {
      const rule = await getReplacedUnicornRule(RULE_WITH_AUTOFIX_DISABLED, FIXABLE_RULE);

      expect(rule?.meta).toContainKey('fixable');
    });

    it('is not kept for a function loading another rule', async () => {
      const rule = await getReplacedUnicornRule(RULE_WITH_AUTOFIX_DISABLED, () => FIXABLE_RULE);

      expect(rule?.meta).toContainKey('fixable');
    });

    it('is kept for a function wrapping the original rule', async () => {
      const rule = await getReplacedUnicornRule(RULE_WITH_AUTOFIX_DISABLED, (original) => ({
        ...original,
      }));

      expect(rule?.meta).not.toContainKey('fixable');
    });

    it('is taken from a built-in rule given by name', async () => {
      const rule = await getReplacedUnicornRule(
        RULE_WITH_AUTOFIX,
        `unicorn/${RULE_WITH_AUTOFIX_DISABLED}`,
      );

      expect(rule?.meta).not.toContainKey('fixable');
    });

    it('is not kept when the built-in rule given by name does not have it', async () => {
      const rule = await getReplacedUnicornRule(
        RULE_WITH_AUTOFIX_DISABLED,
        `unicorn/${RULE_WITH_AUTOFIX}`,
      );

      expect(rule?.meta).toContainKey('fixable');
    });
  });

  it('leaves the version of `eslint-plugin-un` at our own version', async () => {
    const {default: unPlugin} = await import('../../src/plugin-un');

    expect(unPlugin.meta?.version).toBe(ourPackageJson.version);
  });

  // An upstream change of these options must be reviewed: the replacing rules may need it too
  it('keeps the schemas of the original rules replaced by default', async () => {
    const {default: unicornPlugin} = await import('eslint-plugin-unicorn');

    expect(
      REPLACED_BY_DEFAULT.map((ruleName) => unicornPlugin.rules?.[ruleName]?.meta?.schema),
    ).toMatchInlineSnapshot(
      '[[{"additionalProperties": false, "properties": {"allowExpressionStatement": {"type": "boolean"}}, "type": "object"}], [{"additionalProperties": false, "properties": {"allowExpressionStatement": {"type": "boolean"}}, "type": "object"}], []]',
    );
  });
});
