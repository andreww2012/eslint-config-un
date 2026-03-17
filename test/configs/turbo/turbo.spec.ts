import path from 'node:path';

beforeEach(() => {
  addInstalledPackages({turbo: '2.5.4'});
});

const FIXTURES = {
  undeclaredEnvVar: 'undeclared-env-var.js',
} as const;

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures');

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('turbo');

  it('loads `turbo` plugin if used', () => {
    expect(configResult.getLoadedPlugin('turbo')).toBeDefined();
  });

  it('creates `turbo` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('turbo')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `turbo` eslint config', async () => {
      await expectConfigState({}, 'turbo', false);
    });

    it('creates `turbo` eslint config if explicitly enabled', async () => {
      await expectConfigState('turbo', 'turbo', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `turbo` eslint config (`turbo` is installed)', async () => {
      await expectConfigState({}, 'turbo', true, 'default');
    });

    it('creates `turbo` eslint config and prints a warning if explicitly enabled (`turbo` is installed by default)', async () => {
      await expectConfigState('turbo', 'turbo', ['turbo', true], 'default');
    });

    it('does not create `turbo` eslint config if explicitly disabled', async () => {
      await expectConfigState({turbo: false}, 'turbo', false, 'default');
    });

    it('does not create `turbo` eslint config when `turbo` is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, 'turbo', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `turbo` eslint config (`turbo` is installed)', async () => {
      await expectConfigState({}, 'turbo', true, 'misc-enabled');
    });

    it('creates `turbo` eslint config and prints a warning if explicitly enabled (`turbo` is installed by default)', async () => {
      await expectConfigState('turbo', 'turbo', ['turbo', true], 'misc-enabled');
    });

    it('does not create `turbo` eslint config if explicitly disabled', async () => {
      await expectConfigState({turbo: false}, 'turbo', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `turbo` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('turbo')?.files).toBeUndefined();
  });

  it('has default `ignores` in `turbo` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('turbo')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('turbo');

  it('enables `turbo/no-undeclared-env-vars` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('turbo', 'turbo/no-undeclared-env-vars')).toBe(2);
  });

  it('`turbo/no-undeclared-env-vars` rule fires on a file with an undeclared env var', async () => {
    const results = await testEslintConfig(
      {turbo: {undeclaredEnvVarsOptions: {cwd: FIXTURES_DIR}}},
      FIXTURES.undeclaredEnvVar,
      {searchFixturesRelativeToPath: import.meta.dirname},
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.undeclaredEnvVar,
      'turbo/no-undeclared-env-vars',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"UNDECLARED_VAR is not listed as a dependency in turbo.json"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `turbo` eslint config', async () => {
      const FILES = ['src/**/*.ts'];
      const configResult = await computeEslintConfig({turbo: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('turbo')?.files).toStrictEqual(FILES);
    });

    it('disables `turbo` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({turbo: {files: []}});

      expect(configResult.getConfigByUnPostfix('turbo')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `turbo` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({turbo: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('turbo')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `turbo` eslint config', async () => {
    const configResult = await computeEslintConfig({
      turbo: {overrides: {'turbo/no-undeclared-env-vars': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('turbo', 'turbo/no-undeclared-env-vars')).toBe(0);
    expect(configResult.getRuleEntrySeverity('turbo', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `turbo` eslint config', async () => {
      const configResult = await computeEslintConfig({turbo: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('turbo'), (ruleName) =>
          ruleName.startsWith('turbo/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `turbo` eslint config', async () => {
      const configResult = await computeEslintConfig({turbo: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('turbo'), (ruleName) =>
          ruleName.startsWith('turbo/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `undeclaredEnvVarsOptions`', () => {
    it('does not pass extra options to `turbo/no-undeclared-env-vars` rule when `undeclaredEnvVarsOptions` is not set (default)', async () => {
      const configResult = await computeEslintConfig('turbo');

      expect(
        configResult.getRuleEntry('turbo', 'turbo/no-undeclared-env-vars'),
      ).toMatchInlineSnapshot('[2]');
    });

    it('passes provided options to `turbo/no-undeclared-env-vars` rule when `undeclaredEnvVarsOptions` is set', async () => {
      const OPTIONS = {allowList: ['^CI_']};

      const configResult = await computeEslintConfig({
        turbo: {undeclaredEnvVarsOptions: OPTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('turbo', 'turbo/no-undeclared-env-vars'),
      ).toStrictEqual([OPTIONS]);
    });
  });
});
