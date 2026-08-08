import path from 'node:path';

const FIXTURES = {
  processEnvAccess: 'process-env-access.js',
} as const;

beforeEach(() => {
  addInstalledPackages({turbo: '2.5.4'});
});

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

    describe('`turbo` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `turbo` eslint config', async () => {
        await expectConfigState({}, 'turbo', false, 'default');
      });

      it('creates `turbo` eslint config if explicitly enabled', async () => {
        await expectConfigState('turbo', 'turbo', true, 'default');
      });

      it('does not create `turbo` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({turbo: false}, 'turbo', ['turbo', false], 'default');
      });
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

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('turbo')).toMatchObject({
      'turbo/no-undeclared-env-vars': 2,
    });
  });

  it('`turbo/no-undeclared-env-vars` rule fires on a file with an undeclared env var', async () => {
    const results = await testEslintConfig(
      {turbo: {undeclaredEnvVarsOptions: {cwd: FIXTURES_DIR}}},
      FIXTURES.processEnvAccess,
      {searchFixturesRelativeToPath: import.meta.dirname},
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.processEnvAccess,
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

    it('disables `turbo` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({turbo: {files: []}});

      expect(configResult.getConfigByUnPostfix('turbo')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `turbo` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({turbo: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('turbo')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', () => {
  describe('option: `undeclaredEnvVarsOptions`', () => {
    it('does not pass extra options to `turbo/no-undeclared-env-vars` rule by default', async () => {
      const configResult = await computeEslintConfig('turbo');

      expect(
        configResult.getRuleEntryOptions('turbo', 'turbo/no-undeclared-env-vars'),
      ).toStrictEqual([]);
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
