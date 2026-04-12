const FIXTURES = {
  onlyTest: 'only-test.spec.ts',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('noOnlyTests');

  it('loads `no-only-tests` plugin if used', () => {
    expect(configResult.getLoadedPlugin('no-only-tests')).toBeDefined();
  });

  it('creates `no-only-tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-only-tests')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `no-only-tests` eslint config', async () => {
      await expectConfigState({}, 'no-only-tests', false);
    });

    it('creates `no-only-tests` eslint config if explicitly enabled', async () => {
      await expectConfigState('noOnlyTests', 'no-only-tests', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `no-only-tests` eslint config', async () => {
      await expectConfigState({}, 'no-only-tests', false, 'default');
    });

    it('creates `no-only-tests` eslint config if explicitly enabled', async () => {
      await expectConfigState('noOnlyTests', 'no-only-tests', true, 'default');
    });

    it('does not create `no-only-tests` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noOnlyTests: false},
        'no-only-tests',
        ['noOnlyTests', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `no-only-tests` eslint config', async () => {
      await expectConfigState({}, 'no-only-tests', false, 'misc-enabled');
    });

    it('creates `no-only-tests` eslint config if explicitly enabled', async () => {
      await expectConfigState({noOnlyTests: true}, 'no-only-tests', true, 'misc-enabled');
    });

    it('does not create `no-only-tests` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {noOnlyTests: false},
        'no-only-tests',
        ['noOnlyTests', false],
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `no-only-tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-only-tests')?.files).toMatchInlineSnapshot(
      '["**/*.spec.?([cm])[jt]s?(x)", "**/*-spec.?([cm])[jt]s?(x)", "**/*_spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__tests__/**/*.?([cm])[jt]s?(x)", "**/__test__/**/*.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `no-only-tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('no-only-tests')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('noOnlyTests');

  it('enables `no-only-tests/no-only-tests` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('no-only-tests', 'no-only-tests/no-only-tests')).toBe(
      2,
    );
  });

  it('`no-only-tests/no-only-tests` rule fires on a test file with `.only`', async () => {
    const results = await testEslintConfig('noOnlyTests', FIXTURES.onlyTest, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.onlyTest,
      'no-only-tests/no-only-tests',
    );

    expect(error?.message).toMatchInlineSnapshot('"it.only not permitted"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `no-only-tests` eslint config', async () => {
      const FILES = ['src/**/*.spec.ts'];

      const configResult = await computeEslintConfig({noOnlyTests: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('no-only-tests')?.files).toStrictEqual(FILES);
    });

    it('disables `no-only-tests` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({noOnlyTests: {files: []}});

      expect(configResult.getConfigByUnPostfix('no-only-tests')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `no-only-tests` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({noOnlyTests: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('no-only-tests')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `no-only-tests` eslint config', async () => {
    const configResult = await computeEslintConfig({
      noOnlyTests: {
        overrides: {'no-only-tests/no-only-tests': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('no-only-tests', 'no-only-tests/no-only-tests')).toBe(
      0,
    );
    expect(configResult.getRuleEntrySeverity('no-only-tests', 'no-console')).toBe(0);
  });
});
