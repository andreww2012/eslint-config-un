const FIXTURES = {
  wrongIndentation: 'wrong-indentation.yaml',
} as const;

const CONFIG_POSTFIX = 'no-prettier-incompatible-rules';

beforeEach(() => {
  addInstalledPackages({prettier: '3.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('noPrettierIncompatibleRules');

  it('creates `no-prettier-incompatible-rules` eslint config', () => {
    expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-prettier-incompatible-rules` eslint config', async () => {
      await expectConfigState({}, CONFIG_POSTFIX, false);
    });

    it('creates `no-prettier-incompatible-rules` eslint config if explicitly enabled', async () => {
      await expectConfigState('noPrettierIncompatibleRules', CONFIG_POSTFIX, true);
    });

    it('does not create `no-prettier-incompatible-rules` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({noPrettierIncompatibleRules: false}, CONFIG_POSTFIX, [
        'noPrettierIncompatibleRules',
        false,
      ]);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `no-prettier-incompatible-rules` eslint config when `prettier` is installed', async () => {
      await expectConfigState({}, CONFIG_POSTFIX, true, 'default');
    });

    it('does not create `no-prettier-incompatible-rules` eslint config when `prettier` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, CONFIG_POSTFIX, false, 'default');
    });

    it('creates `no-prettier-incompatible-rules` eslint config and prints a warning if explicitly enabled when `prettier` is installed', async () => {
      await expectConfigState(
        'noPrettierIncompatibleRules',
        CONFIG_POSTFIX,
        ['noPrettierIncompatibleRules', true],
        'default',
      );
    });

    it('creates `no-prettier-incompatible-rules` eslint config without a warning if explicitly enabled when `prettier` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState('noPrettierIncompatibleRules', CONFIG_POSTFIX, true, 'default');
    });

    it('does not create `no-prettier-incompatible-rules` eslint config if explicitly disabled when `prettier` is installed', async () => {
      await expectConfigState(
        {noPrettierIncompatibleRules: false},
        CONFIG_POSTFIX,
        false,
        'default',
      );
    });

    it('does not create `no-prettier-incompatible-rules` eslint config and prints a warning if explicitly disabled when `prettier` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState(
        {noPrettierIncompatibleRules: false},
        CONFIG_POSTFIX,
        ['noPrettierIncompatibleRules', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `no-prettier-incompatible-rules` eslint config', async () => {
      await expectConfigState({}, CONFIG_POSTFIX, true, 'misc-enabled');
    });

    it('creates `no-prettier-incompatible-rules` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'noPrettierIncompatibleRules',
        CONFIG_POSTFIX,
        ['noPrettierIncompatibleRules', true],
        'misc-enabled',
      );
    });

    it('does not create `no-prettier-incompatible-rules` eslint config if explicitly disabled', async () => {
      await expectConfigState(
        {noPrettierIncompatibleRules: false},
        CONFIG_POSTFIX,
        false,
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `no-prettier-incompatible-rules` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.files).toBeUndefined();
  });

  it('has no default `ignores` in `no-prettier-incompatible-rules` eslint config', () => {
    expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noPrettierIncompatibleRules');

  it('disables `stylistic/indent` rule with the resolved (renamed) prefix, not the canonical `@stylistic/indent`', () => {
    expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'stylistic/indent')).toBe(0);
    expect(configResult.getRuleEntry(CONFIG_POSTFIX, '@stylistic/indent')).toBeUndefined();
  });

  it('does not emit any rule with a canonical `@stylistic/` or `@typescript-eslint/` prefix', () => {
    const ruleNames = Object.keys(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.rules || {});

    expect(
      ruleNames.filter(
        (ruleName) =>
          ruleName.startsWith('@stylistic/') || ruleName.startsWith('@typescript-eslint/'),
      ),
    ).toBeEmpty();
  });

  it('disables the `disable-autofix/` counterpart of a fixable disabled rule', () => {
    expect(
      configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'disable-autofix/stylistic/indent'),
    ).toBe(0);
  });

  it('disables the bare (core) `indent` rule', () => {
    expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'indent')).toBe(0);
  });

  it('respects `pluginRenames` when disabling rules', async () => {
    const renamedConfigResult = await computeEslintConfig('noPrettierIncompatibleRules', {
      un: {pluginRenames: {stylistic: 'style'}},
    });

    expect(renamedConfigResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'style/indent')).toBe(0);
    expect(renamedConfigResult.getRuleEntry(CONFIG_POSTFIX, 'stylistic/indent')).toBeUndefined();
  });

  describe('exceptions (rules kept enabled by default)', () => {
    it('does not disable `curly`, `stylistic/quotes`, `unicorn/template-indent`, `vue/html-self-closing` or `vue/html-end-tags`', () => {
      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'curly')).toBeUndefined();
      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'stylistic/quotes')).toBeUndefined();
      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'unicorn/template-indent')).toBeUndefined();
      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'vue/html-self-closing')).toBeUndefined();
      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'vue/html-end-tags')).toBeUndefined();
    });
  });

  it('disables `yaml/indent` rule which fires on a badly indented YAML file when the config is off', async () => {
    const results = await testEslintConfig(
      {yaml: true, noPrettierIncompatibleRules: false},
      FIXTURES.wrongIndentation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.wrongIndentation, 'yaml/indent');

    expect(error?.message).toMatchInlineSnapshot(
      '"Expected indentation of 2 spaces but found 5 spaces."',
    );
  });

  it('silences `yaml/indent` rule when the config is on', async () => {
    const results = await testEslintConfig(
      {yaml: true, noPrettierIncompatibleRules: true},
      FIXTURES.wrongIndentation,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.wrongIndentation, 'yaml/indent');

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-prettier-incompatible-rules` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({noPrettierIncompatibleRules: {files: FILES}});

      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.files).toStrictEqual(FILES);
    });

    it('disables `no-prettier-incompatible-rules` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({noPrettierIncompatibleRules: {files: []}});

      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-prettier-incompatible-rules` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        noPrettierIncompatibleRules: {ignores: IGNORES},
      });

      expect(configResult.getConfigByUnPostfix(CONFIG_POSTFIX)?.ignores).toStrictEqual(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-prettier-incompatible-rules` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noPrettierIncompatibleRules: {
        overrides: {'stylistic/indent': 2, curly: 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'stylistic/indent')).toBe(2);
    expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'curly')).toBe(0);
    expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `languages`', () => {
    it('disables the `toml` group by default only when `prettier-plugin-toml` is not installed', async () => {
      const configResult = await computeEslintConfig('noPrettierIncompatibleRules');

      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'toml/indent')).toBeUndefined();
    });

    it('applies the `toml` group when `prettier-plugin-toml` is installed', async () => {
      addInstalledPackages({'prettier-plugin-toml': '2.0.0'});

      const configResult = await computeEslintConfig('noPrettierIncompatibleRules');

      expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'toml/indent')).toBe(0);
    });

    it('applies the `toml` group when forced on via `languages.toml` even without the plugin', async () => {
      const configResult = await computeEslintConfig({
        noPrettierIncompatibleRules: {languages: {toml: true}},
      });

      expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'toml/indent')).toBe(0);
    });

    it('does not apply a group when it is turned off via `languages`', async () => {
      const configResult = await computeEslintConfig({
        noPrettierIncompatibleRules: {languages: {js: false}},
      });

      expect(configResult.getRuleEntry(CONFIG_POSTFIX, 'stylistic/indent')).toBeUndefined();
    });

    it('applies a group by default when it is not gated behind a plugin', async () => {
      const configResult = await computeEslintConfig('noPrettierIncompatibleRules');

      expect(configResult.getRuleEntrySeverity(CONFIG_POSTFIX, 'yaml/indent')).toBe(0);
    });
  });
});
